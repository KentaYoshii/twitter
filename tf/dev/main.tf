resource "aws_ecr_repository" "ecr_repository_tc" {
  name = "${var.resource_prefix}-ecr"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecs_cluster" "ecs_cluster_tc" {
  name = "${var.resource_prefix}-ecs"
}

resource "aws_cloudwatch_log_group" "cloudwatch_log_group_tc" {
  name = "${var.resource_prefix}-lg"
}

data "aws_ecr_image" "service_image" {
  repository_name = "intern-kentayoshii-tclone-ecr"
  most_recent = true
}

resource "aws_ecs_task_definition" "ecs_task_definition_tc" {
  family                   = "${var.resource_prefix}-ecs_def"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  network_mode             = var.network_mode
  task_role_arn            = var.role_arn
  execution_role_arn       = var.role_arn

  container_definitions = jsonencode([
    {
      name   = "${var.resource_prefix}-cd"
      image  = "${aws_ecr_repository.ecr_repository_tc.repository_url}:${data.aws_ecr_image.service_image.image_tags[0]}"
      cpu    = 256
      memory = 512
      portMappings = [
        {
          containerPort = 80
        }
      ]
      environment = [
        { "name" : "PORT", "value" : "80" },
        { "name" : "NODE_ENV", "value" : "production" },
        { "name" : "DYNAMODB_REGION", "value" : "ap-northeast-1" },
        { "name" : "S3_REGION", "value" : "ap-northeast-1" },
        { "name" : "BUCKET_NAME", "value" : "intern-kentayoshii" },
        { "name" : "TABLE_NAME", "value" : "intern-kentayoshii-twitter-clone"},
        { "name" : "GOOGLE_REDIRECT_URI", "value" : "https://kentayoshii.intern.aws.prd.demodesu.com/auth/callback" },
      ]
      environmentFiles = [
        {
          "value" : "arn:aws:s3:::intern-kentayoshii/tclone.env",
          "type" : "s3",
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.cloudwatch_log_group_tc.name
          awslogs-region        = "ap-northeast-1"
          awslogs-stream-prefix = "latest"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "aws_ecs_service_tc" {
  name                  = "${var.resource_prefix}-ecs_service"
  cluster               = aws_ecs_cluster.ecs_cluster_tc.id
  health_check_grace_period_seconds = 3600
  task_definition       = aws_ecs_task_definition.ecs_task_definition_tc.arn
  desired_count         = 2
  launch_type           = "FARGATE"
  wait_for_steady_state = true
  load_balancer {
    target_group_arn = module.tc-alb.target_group_arns[0]
    container_name = "${var.resource_prefix}-cd"
    container_port = 80
  }

  network_configuration {
    security_groups  = [module.tc-ecs-sg.security_group_id]
    subnets          = module.tc-vpc.public_subnets
    assign_public_ip = true
  }
}

// ALIAS RECORD
resource "aws_route53_record" "tclone_record" {
  zone_id = "Z1HCSX5F3LI1KR"
  name    = "kentayoshii.intern.aws.prd.demodesu.com"
  type    = "A"

  alias {
    name                   = module.tc-alb.lb_dns_name
    zone_id                = module.tc-alb.lb_zone_id
    evaluate_target_health = true
  }
}