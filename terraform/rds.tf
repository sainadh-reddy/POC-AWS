# RDS MySQL Database Configuration (Private Subnet, Encrypted, Automated Backups)

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.prefix}-rds-subnet-group"
  subnet_ids = [aws_subnet.private_db_1.id, aws_subnet.private_db_2.id]

  tags = {
    Name = "${var.prefix}-rds-subnet-group"
  }
}

resource "aws_db_instance" "mysql" {
  identifier             = "${var.prefix}-mysql-db"
  allocated_storage      = 20
  max_allocated_storage  = 50
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t4g.micro" # Cost-efficient ARM-based DB instance
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db_password.result
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  # Strict Compliance Requirements
  publicly_accessible     = false # Item 16 & Pass/Fail Item 3
  storage_encrypted       = true  # Item 20
  backup_retention_period = 1     # Free Tier compatible
  skip_final_snapshot     = true  # Enables clean terraform destroy

  tags = {
    Name = "${var.prefix}-mysql-instance"
  }
}
