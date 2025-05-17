resource "aws_lambda_function" "book_api" {
  function_name = "book-api"
  runtime       = "nodejs18.x"
  handler       = "handlers/createBook.handler"
  role          = aws_iam_role.lambda_exec_role.arn

  s3_bucket = aws_s3_bucket.lambda_artifacts.bucket
  s3_key    = "book-api.zip" # or whatever your uploaded file key is

  source_code_hash = filebase64sha256("../book-api.zip")

  environment {
    variables = {
      DYNAMO_TABLE = "Books"
      JWT_SECRET   = "your_secret"
    }
  }
}