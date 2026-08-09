# ECS Fargate Cluster, CloudWatch Logs, Task Definitions, & Services for ALL Microservices

resource "aws_ecs_cluster" "main" {
  name = "${var.prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.prefix}-ecs-cluster"
  }
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.prefix}-microservices"
  retention_in_days = 14

  tags = {
    Name = "${var.prefix}-ecs-log-group"
  }
}

locals {
  db_environment = [
    {
      name  = "SPRING_DATASOURCE_DRIVER"
      value = "com.mysql.cj.jdbc.Driver"
    },
    {
      name  = "AWS_REGION"
      value = var.aws_region
    }
  ]

  db_secrets = [
    {
      name      = "SPRING_DATASOURCE_URL"
      valueFrom = aws_ssm_parameter.db_url.arn
    },
    {
      name      = "SPRING_DATASOURCE_USERNAME"
      valueFrom = aws_ssm_parameter.db_user.arn
    },
    {
      name      = "SPRING_DATASOURCE_PASSWORD"
      valueFrom = aws_ssm_parameter.db_pass.arn
    }
  ]
}

# 1. Eureka Server (Port 8761)
resource "aws_ecs_task_definition" "eureka_server" {
  family                   = "${var.prefix}-eureka-server"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "eureka-server"
      image     = "${aws_ecr_repository.eureka_server.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.eureka_port
          hostPort      = var.eureka_port
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "eureka"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "eureka_server" {
  name            = "${var.prefix}-eureka-server"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.eureka_server.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  service_registrations {
    registry_arn = aws_service_discovery_service.eureka.arn
  }
}

# 2. API Gateway (Port 8080)
resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "${var.prefix}-api-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "api-gateway"
      image     = "${aws_ecr_repository.api_gateway.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.gateway_port
          hostPort      = var.gateway_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "EUREKA_URI"
          value = "http://eureka-server.${var.prefix}.local:8761/eureka/"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "gateway"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api_gateway" {
  name            = "${var.prefix}-api-gateway"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.gateway_tg.arn
    container_name   = "api-gateway"
    container_port   = var.gateway_port
  }

  depends_on = [
    aws_lb_listener.http,
    aws_ecs_service.eureka_server
  ]
}

# 3. Auth Service (Port 8081)
resource "aws_ecs_task_definition" "auth_service" {
  family                   = "${var.prefix}-auth-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "auth-service"
      image     = "${aws_ecr_repository.auth_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.auth_port
          hostPort      = var.auth_port
          protocol      = "tcp"
        }
      ]
      environment = concat(local.db_environment, [
        {
          name  = "EUREKA_URI"
          value = "http://eureka-server.${var.prefix}.local:8761/eureka/"
        }
      ])
      secrets = local.db_secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "auth"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "auth_service" {
  name            = "${var.prefix}-auth-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.auth_tg.arn
    container_name   = "auth-service"
    container_port   = var.auth_port
  }

  service_registrations {
    registry_arn = aws_service_discovery_service.auth.arn
  }

  depends_on = [
    aws_db_instance.mysql,
    aws_ecs_service.eureka_server
  ]
}

# 4. Ticket Service (Port 8082)
resource "aws_ecs_task_definition" "ticket_service" {
  family                   = "${var.prefix}-ticket-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "ticket-service"
      image     = "${aws_ecr_repository.ticket_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.ticket_port
          hostPort      = var.ticket_port
          protocol      = "tcp"
        }
      ]
      environment = concat(local.db_environment, [
        {
          name  = "EUREKA_URI"
          value = "http://eureka-server.${var.prefix}.local:8761/eureka/"
        },
        {
          name  = "S3_ATTACHMENT_BUCKET"
          value = aws_s3_bucket.attachments.id
        }
      ])
      secrets = local.db_secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ticket"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "ticket_service" {
  name            = "${var.prefix}-ticket-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ticket_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ticket_tg.arn
    container_name   = "ticket-service"
    container_port   = var.ticket_port
  }

  service_registrations {
    registry_arn = aws_service_discovery_service.ticket.arn
  }

  depends_on = [
    aws_lb_listener.http,
    aws_db_instance.mysql,
    aws_ecs_service.eureka_server
  ]
}

# 5. Attachment Service (Port 8083)
resource "aws_ecs_task_definition" "attachment_service" {
  family                   = "${var.prefix}-attachment-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "attachment-service"
      image     = "${aws_ecr_repository.attachment_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.attachment_port
          hostPort      = var.attachment_port
          protocol      = "tcp"
        }
      ]
      environment = concat(local.db_environment, [
        {
          name  = "EUREKA_URI"
          value = "http://eureka-server.${var.prefix}.local:8761/eureka/"
        },
        {
          name  = "S3_ATTACHMENT_BUCKET"
          value = aws_s3_bucket.attachments.id
        }
      ])
      secrets = local.db_secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "attachment"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "attachment_service" {
  name            = "${var.prefix}-attachment-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.attachment_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.attachment_tg.arn
    container_name   = "attachment-service"
    container_port   = var.attachment_port
  }

  service_registrations {
    registry_arn = aws_service_discovery_service.attachment.arn
  }

  depends_on = [
    aws_db_instance.mysql,
    aws_ecs_service.eureka_server
  ]
}

# 6. Comment Service (Port 8084)
resource "aws_ecs_task_definition" "comment_service" {
  family                   = "${var.prefix}-comment-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "comment-service"
      image     = "${aws_ecr_repository.comment_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.comment_port
          hostPort      = var.comment_port
          protocol      = "tcp"
        }
      ]
      environment = concat(local.db_environment, [
        {
          name  = "EUREKA_URI"
          value = "http://eureka-server.${var.prefix}.local:8761/eureka/"
        }
      ])
      secrets = local.db_secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "comment"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "comment_service" {
  name            = "${var.prefix}-comment-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.comment_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.comment_tg.arn
    container_name   = "comment-service"
    container_port   = var.comment_port
  }

  service_registrations {
    registry_arn = aws_service_discovery_service.comment.arn
  }

  depends_on = [
    aws_db_instance.mysql,
    aws_ecs_service.eureka_server
  ]
}

# 7. Dashboard Service (Port 8085)
resource "aws_ecs_task_definition" "dashboard_service" {
  family                   = "${var.prefix}-dashboard-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "dashboard-service"
      image     = "${aws_ecr_repository.dashboard_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.dashboard_port
          hostPort      = var.dashboard_port
          protocol      = "tcp"
        }
      ]
      environment = concat(local.db_environment, [
        {
          name  = "EUREKA_URI"
          value = "http://eureka-server.${var.prefix}.local:8761/eureka/"
        }
      ])
      secrets = local.db_secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "dashboard"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "dashboard_service" {
  name            = "${var.prefix}-dashboard-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.dashboard_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.dashboard_tg.arn
    container_name   = "dashboard-service"
    container_port   = var.dashboard_port
  }

  service_registrations {
    registry_arn = aws_service_discovery_service.dashboard.arn
  }

  depends_on = [
    aws_db_instance.mysql,
    aws_ecs_service.eureka_server
  ]
}
