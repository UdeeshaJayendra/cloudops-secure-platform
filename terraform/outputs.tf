output "vpc_id" {
  description = "CloudOps VPC ID"
  value       = aws_vpc.cloudops.id
}

output "public_subnet_ids" {
  description = "CloudOps public subnet IDs"
  value = [
    aws_subnet.public_a.id,
    aws_subnet.public_b.id
  ]
}

output "private_subnet_ids" {
  description = "CloudOps private subnet IDs"
  value = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]
}
