# resource "aws_dynamodb_table" "books" {
#   name           = "Books"
#   billing_mode   = "PAY_PER_REQUEST"
#   hash_key       = "id"

#   attribute {
#     name = "id"
#     type = "S"
#   }

#   tags = {
#     Name = "BooksTable"
#     Environment = "dev"
#   }
# }