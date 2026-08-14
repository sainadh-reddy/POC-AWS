# ECR Repositories for ALL 7 TicketDesk Microservices

resource "aws_ecr_repository" "eureka_server" {
  name                 = "${var.prefix}-eureka-server"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-eureka-server-ecr"
  }
}

resource "aws_ecr_repository" "api_gateway" {
  name                 = "${var.prefix}-api-gateway"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-api-gateway-ecr"
  }
}

resource "aws_ecr_repository" "auth_service" {
  name                 = "${var.prefix}-auth-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-auth-service-ecr"
  }
}

resource "aws_ecr_repository" "ticket_service" {
  name                 = "${var.prefix}-ticket-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-ticket-service-ecr"
  }
}

resource "aws_ecr_repository" "attachment_service" {
  name                 = "${var.prefix}-attachment-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-attachment-service-ecr"
  }
}

resource "aws_ecr_repository" "comment_service" {
  name                 = "${var.prefix}-comment-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-comment-service-ecr"
  }
}

resource "aws_ecr_repository" "dashboard_service" {
  name                 = "${var.prefix}-dashboard-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-dashboard-service-ecr"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.prefix}-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-frontend-ecr"
  }
}

