variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS Region for deployment (lowest cost region)"
}

variable "prefix" {
  type        = string
  default     = "tkt-desk"
  description = "Resource prefix required by project specification (tkt-desk-*)"
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "Deployment environment name"
}

variable "db_name" {
  type        = string
  default     = "ticketdesk_db"
  description = "MySQL database name"
}

variable "db_username" {
  type        = string
  default     = "dbadmin"
  description = "RDS master username"
}

variable "container_port" {
  type        = number
  default     = 8082
  description = "Port exposed by the backend ticket service container"
}

variable "app_count" {
  type        = number
  default     = 2
  description = "Number of ECS tasks to run for high availability across AZs"
}
