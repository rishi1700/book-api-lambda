resource "aws_s3_bucket" "lambda_artifacts" {
  bucket = "book-api-artifacts"

  tags = {
    Name        = "Lambda Artifact Bucket"
    Environment = "dev"
  }
}