terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "cloudvault-terraform-state"
    key            = "state/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./modules/network"
}

module "storage" {
  source      = "./modules/storage"
  bucket_name = var.bucket_name
}

module "iam" {
  source     = "./modules/iam"
  bucket_arn = module.storage.bucket_arn
}

module "compute" {
  source                = "./modules/compute"
  vpc_id                = module.network.vpc_id
  public_subnets        = module.network.public_subnets
  app_subnets           = module.network.app_subnets
  instance_profile_name = module.iam.instance_profile_name
}
