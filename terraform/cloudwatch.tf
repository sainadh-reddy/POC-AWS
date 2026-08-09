# Observability: CloudWatch Dashboard & Metric Alarms (Milestone M7, Checklist Items 28, 29, 30)

# SNS Topic for Alarm Notifications (Item 30)
resource "aws_sns_topic" "alerts" {
  name = "${var.prefix}-alerts-topic"

  tags = {
    Name = "${var.prefix}-alerts-sns"
  }
}

# 1. Alarm 1: ALB 5xx Errors Alarm (Item 30)
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${var.prefix}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Triggers when ALB target 5xx error count exceeds 5 in 1 minute"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# 2. Alarm 2: Target Group Unhealthy Targets Alarm (Item 30)
resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name          = "${var.prefix}-unhealthy-targets"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "Triggers when target group unhealthy host count is 1 or more"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.api_tg.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# 3. Alarm 3: High Database CPU Utilization Alarm (Item 30)
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.prefix}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when RDS CPU utilization exceeds 80% for 10 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.mysql.identifier
  }
}

# Operational CloudWatch Dashboard (Item 29)
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "ALB Request Count"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", aws_lb.main.arn_suffix],
            ["AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "HTTP 4xx / 5xx Error Rates"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ALB Target Response Time (Latency)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.mysql.identifier],
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", aws_db_instance.mysql.identifier]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Database CPU & Connections"
        }
      }
    ]
  })
}
