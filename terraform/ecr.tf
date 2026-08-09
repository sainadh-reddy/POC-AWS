# ECR Repositories for TicketDesk Containers

resource "aws_ecr_repository" "ticket_service" {
  name                 = "${var.prefix}-ticket-service"
  image_tag_mutability = "MUTABLE"

  # Image Scanning Enabled for Checklist Item 5
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-ticket-service-ecr"
  }
}

resource "aws_ecr_repository" "api_gateway" {
  name                 = "${var.prefix}-api-gateway"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.prefix}-api-gateway-ecr"
  }
}
