# Security Groups with Strict Referencing (Compliance Checklist Item 12 & Pass/Fail Item 3)

# 1. Load Balancer Security Group (Public facing)
resource "aws_security_group" "alb_sg" {
  name        = "${var.prefix}-alb-sg"
  description = "Controls HTTP traffic to Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow HTTP traffic from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS traffic from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic from ALB"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.prefix}-alb-sg"
  }
}

# 2. ECS Fargate Security Group (Private Subnet - traffic allowed ONLY from ALB Security Group)
resource "aws_security_group" "ecs_sg" {
  name        = "${var.prefix}-ecs-sg"
  description = "Allows traffic to ECS container tasks strictly from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow traffic from ALB on app container port"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # SG Reference - NOT 0.0.0.0/0
  }

  ingress {
    description     = "Allow traffic from ALB on API Gateway port"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # SG Reference - NOT 0.0.0.0/0
  }

  egress {
    description = "Allow all outbound traffic from ECS tasks for ECR image pull and AWS APIs"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.prefix}-ecs-sg"
  }
}

# 3. RDS MySQL Security Group (Private Subnet - traffic allowed ONLY from ECS Security Group)
resource "aws_security_group" "rds_sg" {
  name        = "${var.prefix}-rds-sg"
  description = "Allows MySQL traffic strictly from ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow MySQL traffic strictly from ECS SG"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id] # SG Reference - NOT 0.0.0.0/0
  }

  egress {
    description = "Outbound traffic for database"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.prefix}-rds-sg"
  }
}
