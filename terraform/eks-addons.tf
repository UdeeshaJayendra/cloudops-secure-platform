resource "aws_eks_addon" "pod_identity_agent" {
  cluster_name = aws_eks_cluster.cloudops.name
  addon_name   = "eks-pod-identity-agent"

  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  tags = {
    Name        = "${local.project_name}-pod-identity-agent"
    Environment = local.environment
    Project     = local.project_name
  }

  depends_on = [
    aws_eks_node_group.cloudops
  ]
}

resource "aws_eks_addon" "ebs_csi" {
  cluster_name = aws_eks_cluster.cloudops.name
  addon_name   = "aws-ebs-csi-driver"

  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  pod_identity_association {
    role_arn        = aws_iam_role.ebs_csi.arn
    service_account = "ebs-csi-controller-sa"
  }

  tags = {
    Name        = "${local.project_name}-ebs-csi"
    Environment = local.environment
    Project     = local.project_name
  }

  depends_on = [
    aws_iam_role_policy_attachment.ebs_csi,
    aws_eks_node_group.cloudops,
    aws_eks_addon.pod_identity_agent
  ]
}