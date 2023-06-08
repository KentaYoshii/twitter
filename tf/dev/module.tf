// VPC
module "tc-vpc" {
  version        = "~> 4.0"
  source         = "terraform-aws-modules/vpc/aws"
  name           = "${var.resource_prefix}-vpc"
  cidr           = "10.0.0.0/16" // network bits = first 16
  azs            = ["ap-northeast-1a", "ap-northeast-1c"]
  public_subnets = ["10.0.1.0/24", "10.0.2.0/24"] // 2^8 = 256 possible ips
}

// Security Group ALB
module "tc-alb-sg" {
  version = "~> 4.0"
  source  = "terraform-aws-modules/security-group/aws"
  vpc_id  = module.tc-vpc.vpc_id
  name    = "${var.resource_prefix}-alb-sg"
  //incoming
  ingress_cidr_blocks = var.ingress_cidr_blocks
  ingress_rules       = ["http-80-tcp", "https-443-tcp"]
  //outgoing
  egress_rules = ["all-all"]
}

// Security Group for ECS
module "tc-ecs-sg" {
  version = "~> 4.0"
  source  = "terraform-aws-modules/security-group/aws"
  vpc_id  = module.tc-vpc.vpc_id
  name    = "${var.resource_prefix}-ecs-sg"
  // Incoming
  ingress_with_source_security_group_id = [{
    from_port                = 0
    to_port                  = 0
    protocol                 = -1
    source_security_group_id = module.tc-alb-sg.security_group_id
    },
  ]
  // Outgoing
  egress_rules = ["all-all"]
}

// Load Balancer
module "tc-alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.0"

  name = "${var.resource_prefix}-alb"

  load_balancer_type = "application"

  vpc_id          = module.tc-vpc.vpc_id
  subnets         = module.tc-vpc.public_subnets
  security_groups = [module.tc-alb-sg.security_group_id]

  target_groups = [
    {
      name_prefix          = "tclone"
      backend_protocol     = "HTTP"
      backend_port         = 80
      target_type          = "ip"
      deregistration_delay = 10 // shortening it
      health_check = {
        enabled             = true
        interval            = 60
        path                = "/health"
        port                = 80
        healthy_threshold   = 3
        unhealthy_threshold = 3
        timeout             = 6
        protocol            = "HTTP"
        matcher             = "200"
      }
      stickiness = {
        type = "lb_cookie"
        enabled = true
      }
    }
  ]

  http_tcp_listeners = [
    {
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  https_listeners = [
    {
      port               = 443
      protocol           = "HTTPS"
      certificate_arn    = module.acm.acm_certificate_arn
      target_group_index = 0
    }
  ]
}

// ACM
module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 4.0"

  domain_name = "kentayoshii.intern.aws.prd.demodesu.com"
  zone_id     = "Z1HCSX5F3LI1KR"

  wait_for_validation = true
}

module "endpoints" {
  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
  version = "~> 4.0"
  vpc_id             = module.tc-vpc.vpc_id
  security_group_ids = [module.tc-vpc.default_security_group_id]

  endpoints = {
    dynamodb = {
      service         = "dynamodb"
      service_type    = "Gateway"
      route_table_ids = flatten([module.tc-vpc.public_route_table_ids])
      policy          = data.aws_iam_policy_document.dynamodb_endpoint_policy.json
    },
  }
}
data "aws_security_group" "default" {
  name   = "default"
  vpc_id = module.tc-vpc.vpc_id
}

data "aws_iam_policy_document" "dynamodb_endpoint_policy" {
  statement {
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "StringNotEquals"
      variable = "aws:sourceVpce"

      values = [module.tc-vpc.vpc_id]
    }
  }
}