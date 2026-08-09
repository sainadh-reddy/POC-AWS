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

variable "app_count" {
  type        = number
  default     = 1
  description = "Number of ECS tasks to run for each microservice"
}

# Sequential Microservice Ports
variable "gateway_port" {
  type        = number
  default     = 8080
  description = "Port for API Gateway"
}

variable "auth_port" {
  type        = number
  default     = 8081
  description = "Port for Auth Service"
}

variable "ticket_port" {
  type        = number
  default     = 8082
  description = "Port for Ticket Service"
}

variable "attachment_port" {
  type        = number
  default     = 8083
  description = "Port for Attachment Service"
}

variable "comment_port" {
  type        = number
  default     = 8084
  description = "Port for Comment Service"
}

variable "dashboard_port" {
  type        = number
  default     = 8085
  description = "Port for Dashboard Service"
}

variable "eureka_port" {
  type        = number
  default     = 8761
  description = "Port for Eureka Discovery Server"
}
