resource "aws_vpc" "cloudops" {
  cidr_block           = "10.50.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${local.project_name}-vpc"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.cloudops.id
  cidr_block              = "10.50.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${local.project_name}-public-a"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.cloudops.id
  cidr_block              = "10.50.2.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${local.project_name}-public-b"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.cloudops.id
  cidr_block        = "10.50.11.0/24"
  availability_zone = "ap-south-1a"

  tags = {
    Name        = "${local.project_name}-private-a"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.cloudops.id
  cidr_block        = "10.50.12.0/24"
  availability_zone = "ap-south-1b"

  tags = {
    Name        = "${local.project_name}-private-b"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_internet_gateway" "cloudops" {
  vpc_id = aws_vpc.cloudops.id

  tags = {
    Name        = "${local.project_name}-igw"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.cloudops.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.cloudops.id
  }

  tags = {
    Name        = "${local.project_name}-public-rt"
    Environment = local.environment
    Project     = local.project_name
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}
