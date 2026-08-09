# Terraform Deployment Outputs

output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
  description = "Public URL for TicketDesk Frontend via CloudFront CDN"
}

output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Application Load Balancer DNS Name"
}

output "rds_mysql_endpoint" {
  value       = aws_db_instance.mysql.endpoint
  description = "Private RDS MySQL Endpoint"
}

output "ecr_ticket_service_url" {
  value       = aws_ecr_repository.ticket_service.repository_url
  description = "ECR Repository URL for Backend Ticket Service"
}

output "s3_frontend_bucket" {
  value       = aws_s3_bucket.frontend.id
  description = "Private S3 Bucket hosting static frontend dist"
}

output "s3_attachments_bucket" {
  value       = aws_s3_bucket.attachments.id
  description = "S3 Bucket for attachments presigned upload"
}

output "cloudwatch_dashboard_url" {
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  description = "Direct AWS Console URL for CloudWatch Operational Dashboard"
}
