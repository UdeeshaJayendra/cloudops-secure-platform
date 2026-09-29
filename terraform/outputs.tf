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

output "eks_cluster_name" {
  description = "CloudOps EKS cluster name"
  value       = aws_eks_cluster.cloudops.name
}

output "eks_cluster_endpoint" {
  description = "CloudOps EKS API endpoint"
  value       = aws_eks_cluster.cloudops.endpoint
}

output "eks_node_group_name" {
  description = "CloudOps EKS node group name"
  value       = aws_eks_node_group.cloudops.node_group_name
}
