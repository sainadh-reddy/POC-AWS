# Application Load Balancer & Target Groups for ALL Microservices

resource "aws_lb" "main" {
  name               = "${var.prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "${var.prefix}-alb"
  }
}

# 1. Target Group: API Gateway (Port 8080)
resource "aws_lb_target_group" "gateway_tg" {
  name        = "${var.prefix}-gateway-tg"
  port        = var.gateway_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name = "${var.prefix}-gateway-tg"
  }
}

# 2. Target Group: Auth Service (Port 8081)
resource "aws_lb_target_group" "auth_tg" {
  name        = "${var.prefix}-auth-tg"
  port        = var.auth_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name = "${var.prefix}-auth-tg"
  }
}

# 3. Target Group: Ticket Service (Port 8082)
resource "aws_lb_target_group" "ticket_tg" {
  name        = "${var.prefix}-ticket-tg"
  port        = var.ticket_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name = "${var.prefix}-ticket-tg"
  }
}

# 4. Target Group: Attachment Service (Port 8083)
resource "aws_lb_target_group" "attachment_tg" {
  name        = "${var.prefix}-attachment-tg"
  port        = var.attachment_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name = "${var.prefix}-attachment-tg"
  }
}

# 5. Target Group: Comment Service (Port 8084)
resource "aws_lb_target_group" "comment_tg" {
  name        = "${var.prefix}-comment-tg"
  port        = var.comment_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name = "${var.prefix}-comment-tg"
  }
}

# 6. Target Group: Dashboard Service (Port 8085)
resource "aws_lb_target_group" "dashboard_tg" {
  name        = "${var.prefix}-dashboard-tg"
  port        = var.dashboard_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name = "${var.prefix}-dashboard-tg"
  }
}

# HTTP Listener Default Rule (Forwarding to API Gateway Target Group)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_tg.arn
  }
}

# Path-Based Routing Rules for Microservices
resource "aws_lb_listener_rule" "auth_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/auth", "/api/v1/auth/*"]
    }
  }
}

resource "aws_lb_listener_rule" "ticket_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ticket_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/tickets", "/api/v1/tickets/*"]
    }
  }
}

resource "aws_lb_listener_rule" "attachment_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 30

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.attachment_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/attachments", "/api/v1/attachments/*"]
    }
  }
}

resource "aws_lb_listener_rule" "comment_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 40

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.comment_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/comments", "/api/v1/comments/*"]
    }
  }
}

resource "aws_lb_listener_rule" "dashboard_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 50

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.dashboard_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/dashboard", "/api/v1/dashboard/*"]
    }
  }
}
