# Database Password Generation & AWS Secrets Manager (Checklist Items 17, 18, 19)

resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# AWS Secrets Manager Secret for DB Credentials
resource "aws_secretsmanager_secret" "db_secret" {
  name                    = "${var.prefix}-db-credentials"
  recovery_window_in_days = 0 # Ensures clean deletion during terraform destroy

  tags = {
    Name = "${var.prefix}-db-secret"
  }
}

resource "aws_secretsmanager_secret_version" "db_secret_ver" {
  secret_id = aws_secretsmanager_secret.db_secret.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    engine   = "mysql"
    host     = aws_db_instance.mysql.address
    port     = aws_db_instance.mysql.port
    dbname   = var.db_name
  })
}

# AWS Systems Manager Parameter Store for Application Configuration (Checklist Item 18)
resource "aws_ssm_parameter" "db_url" {
  name        = "/${var.prefix}/config/SPRING_DATASOURCE_URL"
  description = "JDBC URL for TicketDesk MySQL Database"
  type        = "String"
  value       = "jdbc:mysql://${aws_db_instance.mysql.endpoint}/${var.db_name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}

resource "aws_ssm_parameter" "db_user" {
  name        = "/${var.prefix}/config/SPRING_DATASOURCE_USERNAME"
  description = "DB Username for TicketDesk"
  type        = "String"
  value       = var.db_username
}

resource "aws_ssm_parameter" "db_pass" {
  name        = "/${var.prefix}/config/SPRING_DATASOURCE_PASSWORD"
  description = "DB Password for TicketDesk"
  type        = "SecureString"
  value       = random_password.db_password.result
}
