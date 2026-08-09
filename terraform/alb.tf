# Application Load Balancer in Public Subnets (Checklist Items 11, 13, 15)

resource "aws_lb" "main" {
  name               = "${var.prefix}-alb"
  internal           = false # Sits in public subnets (Item 11)
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "${var.prefix}-alb"
  }
}

# Target Group for ECS Fargate Tasks
resource "aws_lb_target_group" "api_tg" {
  name        = "${var.prefix}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Required for ECS Fargate awsvpc network mode

  health_check {
    enabled             = true
    path                = "/actuator/health" # Health endpoint (Item 13)
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name = "${var.prefix}-target-group"
  }
}

# HTTP Listener forwarding traffic to Target Group
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
}
