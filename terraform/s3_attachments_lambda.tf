# S3 Buckets for Attachments & Lambda Thumbnail Generator (Checklist Items 23 & 24)

# Attachments Upload Bucket
resource "aws_s3_bucket" "attachments" {
  bucket        = "${var.prefix}-attachments-${var.environment}"
  force_destroy = true

  tags = {
    Name = "${var.prefix}-attachments-bucket"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "attachments_enc" {
  bucket = aws_s3_bucket.attachments.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS Configuration for Presigned S3 Browser Uploads (Item 23)
resource "aws_s3_bucket_cors_configuration" "attachments_cors" {
  bucket = aws_s3_bucket.attachments.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# Generated Thumbnails Bucket
resource "aws_s3_bucket" "thumbnails" {
  bucket        = "${var.prefix}-thumbnails-${var.environment}"
  force_destroy = true

  tags = {
    Name = "${var.prefix}-thumbnails-bucket"
  }
}

# Archive lambda source python code into zip for deployment
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambda/thumbnail_generator.py"
  output_path = "${path.module}/thumbnail_lambda.zip"
}

# IAM Role for Lambda Function (Scoped Permissions - Item 32)
resource "aws_iam_role" "lambda_role" {
  name = "${var.prefix}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.prefix}-lambda-s3-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.attachments.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.thumbnails.arn}/*"
      }
    ]
  })
}

# AWS Lambda Function
resource "aws_lambda_function" "thumbnail_generator" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.prefix}-thumbnail-generator"
  role             = aws_iam_role.lambda_role.arn
  handler          = "thumbnail_generator.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.11"
  timeout          = 30
  layers           = var.pillow_layer_arn != "" ? [var.pillow_layer_arn] : []

  environment {
    variables = {
      THUMBNAIL_BUCKET = aws_s3_bucket.thumbnails.id
    }
  }

  tags = {
    Name = "${var.prefix}-thumbnail-lambda"
  }
}

# S3 Bucket Notification Triggering Lambda on File Upload (Item 24)
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowS3InvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.thumbnail_generator.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.attachments.arn
}

resource "aws_s3_bucket_notification" "attachment_upload" {
  bucket = aws_s3_bucket.attachments.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.thumbnail_generator.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_s3]
}
