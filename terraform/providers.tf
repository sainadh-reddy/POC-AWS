terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # Mandatory Default Tags for Deployment Readiness Checklist Item 31
  default_tags {
    tags = {
      Project     = "TicketDesk"
      Owner       = "DevOps"
      Environment = var.environment
      CostCenter  = "POC-101"
      ManagedBy   = "Terraform"
    }
  }
}
