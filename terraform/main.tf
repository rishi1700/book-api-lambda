provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# Optional S3 bucket managed by Terraform
module "lambda_bucket" {
  source = "./s3"
}

# IAM & Lambda are declared in other files