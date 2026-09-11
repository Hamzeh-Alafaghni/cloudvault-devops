output "app_url" {
  value = module.compute.alb_dns_name
}

output "bucket_name" {
  value = module.storage.bucket_name
}
