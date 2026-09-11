variable "vpc_id" { type = string }
variable "public_subnets" { type = list(string) }
variable "app_subnets" { type = list(string) }
variable "instance_profile_name" { type = string }
