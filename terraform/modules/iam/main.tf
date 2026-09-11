resource "aws_iam_role" "app_role" {
  name = "cloudvault-app-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "s3_access" {
  name = "cloudvault-s3-access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Effect = "Allow"
      Resource = [
        var.bucket_arn,
        "${var.bucket_arn}/*"
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "app_s3" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

resource "aws_iam_instance_profile" "app_profile" {
  name = "cloudvault-app-profile"
  role = aws_iam_role.app_role.name
}
