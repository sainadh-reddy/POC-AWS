# Terraform Deployment Outputs for ALL Microservices

output "cloudfront_url" {
  value       = var.enable_cloudfront && length(aws_cloudfront_distribution.cdn) > 0 ? "https://${aws_cloudfront_distribution.cdn[0].domain_name}" : "Disabled (Access frontend directly via ALB or S3)"
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

output "s3_frontend_bucket" {
  value       = aws_s3_bucket.frontend.id
  description = "Private S3 Bucket hosting static frontend dist"
}

output "s3_attachments_bucket" {
  value       = aws_s3_bucket.attachments.id
  description = "S3 Bucket for attachments presigned upload"
}

output "ecr_repository_urls" {
  value = {
    eureka_server      = aws_ecr_repository.eureka_server.repository_url
    api_gateway        = aws_ecr_repository.api_gateway.repository_url
    auth_service       = aws_ecr_repository.auth_service.repository_url
    ticket_service     = aws_ecr_repository.ticket_service.repository_url
    attachment_service = aws_ecr_repository.attachment_service.repository_url
    comment_service    = aws_ecr_repository.comment_service.repository_url
    dashboard_service  = aws_ecr_repository.dashboard_service.repository_url
  }
  description = "ECR Repository URLs for all 7 microservices"
}

output "cloudwatch_dashboard_url" {
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  description = "Direct AWS Console URL for CloudWatch Operational Dashboard"
}
