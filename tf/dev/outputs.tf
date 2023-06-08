output "acm_certificate_arn" {
  description = "The ARN of the certificate"
  value       = module.acm.acm_certificate_arn
}

output "new_image" {
  description = "New Docker Image"
  value = data.aws_ecr_image.service_image
}