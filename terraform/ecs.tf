# ECS Fargate Cluster, Task Definition, and Service (Checklist Items 10 & 28)

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

# CloudWatch Log Group with Finite Retention Period (Item 28)
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.prefix}-ticket-service"
  retention_in_days = 14 # Finite retention period (not "never expire")

  tags = {
    Name = "${var.prefix}-ecs-log-group"
  }
}

# Task Definition pulling environment variables and secrets dynamically
resource "aws_ecs_task_definition" "api" {
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
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "SPRING_DATASOURCE_DRIVER"
          value = "com.mysql.cj.jdbc.Driver"
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "S3_ATTACHMENT_BUCKET"
          value = aws_s3_bucket.attachments.id
        }
      ]
      secrets = [
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
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "${var.prefix}-task-def"
  }
}

# ECS Service in Private App Subnets (Item 10)
resource "aws_ecs_service" "api" {
  name            = "${var.prefix}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id] # Private subnets ONLY
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_tg.arn
    container_name   = "ticket-service"
    container_port   = var.container_port
  }

  depends_on = [
    aws_lb_listener.http,
    aws_db_instance.mysql
  ]

  tags = {
    Name = "${var.prefix}-ecs-service"
  }
}
