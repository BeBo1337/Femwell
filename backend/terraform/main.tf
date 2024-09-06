terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  
}

resource "aws_ecr_repository" "wolverine_ecr_repo" {
  name = "wolverine"
}

resource "aws_ecr_repository" "denden_ecr_repo" {
  name = "denden"
}

resource "aws_ecr_repository" "vault_ecr_repo" {
  name = "vault"
}

resource "aws_ecr_repository" "heimdall_ecr_repo" {
  name = "heimdall"
}

resource "aws_ecs_cluster" "femwell" {
  name = "femwell"
}

data "aws_iam_role" "existing" {
  name = "LabRole"
}

resource "aws_s3_bucket" "bucket" {
  bucket = "femwell-bucket-users"
}

resource "aws_s3_bucket" "bucketv" {
  bucket = "femwell-videos"
}

resource "aws_cognito_user_pool" "femwell_user_pool" {
  name = "femwell-user-pool"

  password_policy {
    minimum_length    = 7
    require_lowercase = false
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  username_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 5
      max_length = 254
    }
  }

   schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "role"
    required                 = false

    string_attribute_constraints {
      min_length = 0
      max_length = 10
    }
  }

  auto_verified_attributes = ["email"]
  mfa_configuration = "OFF"
}

resource "aws_cognito_user_pool_client" "femwell_client_pool" {
  name = "femwell-client-pool"

  user_pool_id = aws_cognito_user_pool.femwell_user_pool.id

  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]

  callback_urls = ["https://google.com"]

  allowed_oauth_flows_user_pool_client = true
  generate_secret                      = false
}

resource "aws_rds_cluster" "aurora_cluster" {
  cluster_identifier      = "aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  availability_zones      = ["us-east-1a"]
  database_name           = "femdb"
  master_username         = "zach"
  master_password         = "zach1234"
  backup_retention_period = 2
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true
  vpc_security_group_ids  = [aws_security_group.aurora_security_group.id]
  db_subnet_group_name    = aws_db_subnet_group.aurora_subnet_group.name
  
  lifecycle {
    ignore_changes = [availability_zones]
  }
}

resource "aws_rds_cluster_instance" "aurora_instance" {
  identifier         = "aurora-instance"
  cluster_identifier = aws_rds_cluster.aurora_cluster.id
  instance_class     = "db.t3.medium"
  engine             = "aurora-postgresql"

   lifecycle {
    ignore_changes = [availability_zone]
  }
}

# resource "aws_s3_bucket" "kinesis" {
#   bucket = "femwell-audit-logs"
#   acl    = "private"
# }

# resource "aws_kinesis_firehose_delivery_stream" "audit_logs_stream" {
#   name        = "audit-logs-stream"
#   destination = "extended_s3"

#   extended_s3_configuration {
#     role_arn   = data.aws_iam_role.existing.arn
#     bucket_arn = aws_s3_bucket.kinesis.arn
#   }
# }

# resource "aws_elasticache_cluster" "wolverineCache" {
#   cluster_id           = "wolverine-cluster"
#   engine               = "redis"
#   node_type            = "cache.m4.small"
#   num_cache_nodes      = 1
#   parameter_group_name = "default.redis3.2"
#   engine_version       = "3.2.10"
#   port                 = 6379
# }

# resource "aws_elasticache_cluster" "wolverineCache" {
#   cluster_id           = "wolverine-cluster"
#   engine               = "redis"
#   node_type            = "cache.m4.large"
#   num_cache_nodes      = 1
#   parameter_group_name = "default.redis3.2"
#   engine_version       = "3.2.10"
#   port                 = 6379
# }

resource "aws_cloudwatch_log_group" "femwell_task_log_group" {
  name = "/ecs/femwell-task"
}


resource "aws_ecs_task_definition" "wolverine_task" {
  family                   = "wolverine-task"
  container_definitions    = jsonencode(
  [
    {
      name: "wolverine",
      image: aws_ecr_repository.wolverine_ecr_repo.repository_url,
      essential: true,
      portMappings: [
        {
          "containerPort": 3001,
          "hostPort": 3001
        }
      ],
      environment = [
        {
          name = "AWS_REGION"
          value = "us-east-1"
        },

        {
          name  = "LOG_LEVEL"
          value = var.LOG_LEVEL
        },
        {
          name  = "NODE_ENV"
          value = var.NODE_ENV
        },
        {
          name  = "STREAM_ARN"
          value = var.STREAM_ARN
        },
        {
          name  = "COGNITO_USER_POOL_ID"
          value = aws_cognito_user_pool.femwell_user_pool.id
        },
        {
          name  = "COGNITO_CLIENT_ID"
          value = aws_cognito_user_pool_client.femwell_client_pool.id
        },
        {
          name  = "PORT"
          value = var.WOLVERINE_PORT
        },
        {
          name = "POST_LIMIT"
          value = var.POST_LIMIT
        },
        {
          name  = "AWS_AURORA_URL"
          value = "postgresql://${aws_rds_cluster.aurora_cluster.master_username}:${aws_rds_cluster.aurora_cluster.master_password}@${aws_rds_cluster.aurora_cluster.endpoint}:5432/${aws_rds_cluster.aurora_cluster.database_name}"
        },
        {
          name  = "SNS_TOPIC_ARN"
          value = "xxxx"
        },
        {
          name  = "REDIS_HOST"
          value = "redis"
          # value = aws_elasticache_cluster.wolverineCache.cache_nodes.0.address
        },
        {
          name  = "REDIS_PORT"
          value = "6379"
          # value = aws_elasticache_cluster.wolverineCache.port
        },
        { 
          name  = "CACHE_TTL"
          value = "1000"
        },
      ],
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-group": "/ecs/femwell-task",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      memory: 512,
      cpu: 256
    },
    # {
    #   name: "femwell-task-vault",
    #   image: aws_ecr_repository.vault_ecr_repo.repository_url,
    #   essential: true,
    #   portMappings: [
    #     {
    #       "containerPort": 3002,
    #       "hostPort": 3002
    #     }
    #   ],
    #   environment = [
    #     {
    #       name  = "LOG_LEVEL"
    #       value = var.LOG_LEVEL
    #     },
    #     {
    #       name  = "NODE_ENV"
    #       value = var.NODE_ENV
    #     },
    #     {
    #       name  = "STREAM_ARN"
    #       value = audit_logs_stream.arn
    #     },
    #     {
    #       name  = "COGNITO_USER_POOL_ID"
    #       value = aws_cognito_user_pool.femwell_user_pool.id
    #     },
    #     {
    #       name  = "COGNITO_CLIENT_ID"
    #       value = aws_cognito_user_pool_client.femwell_client_pool.id
    #     },
    #     {
    #       name  = "PORT"
    #       value = var.VAULT_PORT
    #     },
    #     {
    #       name  = "WOLVERINE_ENDPOINT"
    #       value = "${aws_alb.femwell_load_balancer.dns_name}\wolverine\graphql"
    #     }
    #   ],
    #   memory: 512,
    #   cpu: 256
    #   logConfiguration: {
    #     logDriver: "awslogs",
    #     options: {
    #       "awslogs-group": "/ecs/femwell-task",
    #       "awslogs-region": "us-east-1", 
    #       "awslogs-stream-prefix": "ecs"
    #     }
    #   },
    # },
 
  #   {
  #     name: "femwell-task-denden",
  #     image: aws_ecr_repository.denden_ecr_repo.repository_url,
  #     essential: false,
  #     portMappings: [
  #       {
  #         "containerPort": 3004,
  #         "hostPort": 3004
  #       }
  #     ],
  #      environment = [
  #       {
  #         name  = "LOG_LEVEL"
  #         value = var.LOG_LEVEL
  #       },
  #       {
  #         name  = "NODE_ENV"
  #         value = var.NODE_ENV
  #       },
  #       {
  #         name  = "STREAM_ARN"
  #         value = var.STREAM_ARN
  #       },
  #       {
  #         name  = "COGNITO_USER_POOL_ID"
  #         value = aws_cognito_user_pool.femwell_user_pool.id
  #       },
  #       {
  #         name  = "COGNITO_CLIENT_ID"
  #         value = aws_cognito_user_pool_client.femwell_client_pool.id
  #       },
  #       {
  #         name  = "PORT"
  #         value = var.DENDEN_PORT
  #       },
  #       {
  #         name  = "AWS_CLOUD_FRONT_ENDPOINT"
  #         value = var.AWS_CLOUD_FRONT_ENDPOINT
  #       },
  #       {
  #         name  = "AWS_CLOUD_FRONT_DISTRIBUTION_ID"
  #         value = var.AWS_CLOUD_FRONT_DISTRIBUTION_ID
  #       }
  #     ],
  #     memory: 512,
  #     cpu: 256
  #   }
  ])
  requires_compatibilities = ["FARGATE"] # use Fargate as the launch type
  network_mode             = "awsvpc"    # add the AWS VPN network mode as this is required for Fargate
  memory                   = 512         # Specify the memory the container requires
  cpu                      = 256       # Specify the CPU the container requires
  runtime_platform {
  operating_system_family = "LINUX"
  cpu_architecture        = "X86_64"
  }
  execution_role_arn = data.aws_iam_role.existing.arn
  task_role_arn      = data.aws_iam_role.existing.arn
}

resource "aws_ecs_service" "femwell_wolverine_service" {
  name            = "femwell-wolverine"
  cluster         = aws_ecs_cluster.femwell.id
  task_definition = aws_ecs_task_definition.wolverine_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  deployment_controller {
    type = "ECS"
  }

  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0

  network_configuration {
    subnets          = module.vpc.public_subnets
    assign_public_ip = true
    security_groups  = [aws_security_group.alb.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.wolverine_target_group.arn
    container_name   = "wolverine"
    container_port   = 3001
  }
}
resource "aws_ecs_task_definition" "vault_task" {
  family                   = "vault-task"
  container_definitions    = jsonencode(
  [
    {
      name: "vault",
      image: aws_ecr_repository.vault_ecr_repo.repository_url,
      essential: true,
      portMappings: [
        {
          "containerPort": 3002,
          "hostPort": 3002
        }
      ],
      environment = [
        {
          name  = "LOG_LEVEL"
          value = var.LOG_LEVEL
        },
        {
          name  = "NODE_ENV"
          value = var.NODE_ENV
        },
        {
          name  = "STREAM_ARN"
          # value = aws_kinesis_firehose_delivery_stream.audit_logs_stream.arn
          value = var.STREAM_ARN
        },
        {
          name  = "COGNITO_USER_POOL_ID"
          value = aws_cognito_user_pool.femwell_user_pool.id
        },
        {
          name  = "COGNITO_CLIENT_ID"
          value = aws_cognito_user_pool_client.femwell_client_pool.id
        },
        {
          name  = "PORT"
          value = var.VAULT_PORT
        },
        {
          name  = "WOLVERINE_ENDPOINT"
          value = "http://${aws_alb.femwell_load_balancer.dns_name}/wolverine/graphql"
        }
      ],
      memory: 512,
      cpu: 256
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-group": "/ecs/femwell-task",
          "awslogs-region": "us-east-1", 
          "awslogs-stream-prefix": "ecs"
        }
      },
    },
  ])
  requires_compatibilities = ["FARGATE"] # use Fargate as the launch type
  network_mode             = "awsvpc"    # add the AWS VPN network mode as this is required for Fargate
  memory                   = 512        # Specify the memory the container requires
  cpu                      = 256         # Specify the CPU the container requires
  runtime_platform {
  operating_system_family = "LINUX"
  cpu_architecture        = "X86_64"
  }
  execution_role_arn = data.aws_iam_role.existing.arn
  task_role_arn      = data.aws_iam_role.existing.arn
}


resource "aws_ecs_service" "femwell_vault_service" {
  name            = "femwell-vault"
  cluster         = aws_ecs_cluster.femwell.id
  task_definition = aws_ecs_task_definition.vault_task.arn
  depends_on      = [aws_ecs_service.femwell_wolverine_service]
  launch_type     = "FARGATE"
  desired_count   = 1

  deployment_controller {
    type = "ECS"
  }

  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0

  network_configuration {
    subnets          = module.vpc.public_subnets
    assign_public_ip = true
    security_groups  = [aws_security_group.alb.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.vault_target_group.arn
    container_name   = "vault"
    container_port   = 3002
  }
}

resource "aws_ecs_task_definition" "heimdall_task" {
  family                   = "heimdall-task"
  container_definitions    = jsonencode(
  [
    {
      name: "heimdall",
      image: aws_ecr_repository.heimdall_ecr_repo.repository_url,
      essential: true,
      portMappings: [
        {
          "containerPort": 3003,
          "hostPort": 3003
        }
      ],
      environment = [
        {
          name  = "LOG_LEVEL"
          value = var.LOG_LEVEL
        },
        {
          name  = "NODE_ENV"
          value = var.NODE_ENV
        },
        {
          name  = "STREAM_ARN"
          # value = aws_kinesis_firehose_delivery_stream.audit_logs_stream.arn
          value = var.STREAM_ARN
        },
        {
          name  = "COGNITO_USER_POOL_ID"
          value = aws_cognito_user_pool.femwell_user_pool.id
        },
        {
          name  = "COGNITO_CLIENT_ID"
          value = aws_cognito_user_pool_client.femwell_client_pool.id
        },
        {
          name  = "PORT"
          value = var.HEIMDALL_PORT
        },
        {
          name  = "AWS_BUCKET"
          value = aws_s3_bucket.bucket.bucket
        },
        {
          name  = "MAX_FILE_SIZE"
          value = var.MAX_FILE_SIZE
        },
        {
          name  = "AWS_S3_ENDPOINT"
          value = "http://${aws_s3_bucket.bucket.bucket_domain_name}"
        },
        {
          name  = "S3_CHECKLIST_KEY"
          value = var.S3_CHECKLIST_KEY
        },
        {
          name  = "SUPPORT_EMAIL"
          value = var.SUPPORT_EMAIL
        },
      ],
      memory: 512,
      cpu: 256
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-group": "/ecs/femwell-task",
          "awslogs-region": "us-east-1", 
          "awslogs-stream-prefix": "ecs"
        }
      },
    },
  ])
  requires_compatibilities = ["FARGATE"] # use Fargate as the launch type
  network_mode             = "awsvpc"    # add the AWS VPN network mode as this is required for Fargate
  memory                   = 512        # Specify the memory the container requires
  cpu                      = 256        
  runtime_platform {
  operating_system_family = "LINUX"
  cpu_architecture        = "X86_64"
  }
  execution_role_arn = data.aws_iam_role.existing.arn
  task_role_arn      = data.aws_iam_role.existing.arn
}


resource "aws_ecs_service" "femwell_heimdall_service" {
  name            = "femwell-heimdall"
  cluster         = aws_ecs_cluster.femwell.id
  task_definition = aws_ecs_task_definition.heimdall_task.arn
  depends_on      = [aws_ecs_service.femwell_wolverine_service]
  launch_type     = "FARGATE"
  desired_count   = 1

  deployment_controller {
    type = "ECS"
  }

  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0

  network_configuration {
    subnets          = module.vpc.public_subnets
    assign_public_ip = true
    security_groups  = [aws_security_group.alb.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.heimdall_target_group.arn
    container_name   = "heimdall"
    container_port   = 3003
  }
}

resource "aws_alb" "femwell_load_balancer" {
  name               = "load-balancer-femwell"
  load_balancer_type = "application"
  subnets = module.vpc.public_subnets
  security_groups = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "wolverine_target_group" {
  name     = "wolverine-target-group"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

    health_check {
    path                = "/wolverine/health"
    interval            = 300
    timeout             = 3
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group" "vault_target_group" {
  name     = "vault-target-group"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/vault/health"
    interval            = 300
    timeout             = 3
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group" "heimdall_target_group" {
  name     = "heimdall-target-group"
  port     = 3003
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"
  
  health_check {
    path                = "/heimdall/health"
    interval            = 300
    timeout             = 3
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group" "denden_target_group" {
  name     = "denden-target-group"
  port     = 3004
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.femwell_load_balancer.arn #  load balancer
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404: Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "wolverine_listener_rule" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.wolverine_target_group.arn
  }

  condition {
    path_pattern {
      values = ["/wolverine/*"]
    }
  }
}

resource "aws_lb_listener_rule" "vault_listener_rule" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.vault_target_group.arn
  }

  condition {
    path_pattern {
      values = ["/vault/*"]
    }
  }
}

resource "aws_lb_listener_rule" "heimdall_listener_rule" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.heimdall_target_group.arn
  }

  condition {
    path_pattern {
      values = ["/heimdall/*"]
    }
  }
}

resource "aws_lb_listener_rule" "denden_listener_rule" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 400

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.denden_target_group.arn
  }

  condition {
    path_pattern {
      values = ["/denden/*"]
    }
  }
}


module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "femwell_vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Terraform = "true"
    Environment = "dev"
    }
  }

  resource "aws_db_subnet_group" "aurora_subnet_group" {
  name       = "aurora-subnet-group"
  subnet_ids = module.vpc.public_subnets

  tags = {
    Name = "aurora-subnet-group"
  }
}

resource "aws_security_group" "aurora_security_group" {
  name        = "aurora-security-group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "aurora-security-group"
  }
}

resource "aws_security_group" "alb" {
  name   = "sg_alb"
  vpc_id = module.vpc.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 3001
    to_port     = 3001
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 3002
    to_port     = 3002
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 3003
    to_port     = 3003
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 3004
    to_port     = 3004
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sg_alb"
  }
}

resource "aws_security_group" "service_security_group" {
  name = "sg_service"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
      Name = "sg_service"
    }
}

#  data "aws_key_pair" "existing_key_pair" {
#    key_name = "my-key-pair" 
#  }

# resource "aws_instance" "frontend_ec2_instance" {
#   ami           = "ami-0a3c3a20c09d6f377" #AZN LINUX
#   instance_type = "t2.small" 
#   key_name      = data.aws_key_pair.existing_key_pair.key_name
#   associate_public_ip_address = true
#   subnet_id = module.vpc.public_subnets[0]
#   security_groups = [aws_security_group.alb.id]

#   user_data = <<-EOF
#               #!/bin/bash
#               sudo yum update -y
#               sudo yum install -y git
#               sudo yum install -y docker
#               sudo service docker start
#               sudo usermod -a -G docker ec2-user
#               sudo yum install -y nginx

#               # Install Node.js
#               curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
#               sudo yum install -y nodejs

#               # Clone your repository
#               sudo git clone https://github.com/BeBo1337/Femwell.git /home/ec2-user/Femwell

#               # Install project dependencies and build the project
#               cd /home/ec2-user/Femwell/frontend
#               sudo npm install
#               sudo npm run build

#               # Copy the built files to Nginx's html directory
#               sudo cp -R /home/ec2-user/Femwell/frontend/dist/* /usr/share/nginx/html

#               #Start Nginx
#               sudo service nginx start
#               EOF

#   tags = {
#     Name = "femwell-frontend"
#   }
# }

output "femwell_url" {
  value = aws_alb.femwell_load_balancer.dns_name
}

output "s3_endpoint" {
  value = aws_s3_bucket.bucket.bucket_regional_domain_name
}

output "aurora_endpoint" {
  value = aws_rds_cluster.aurora_cluster.endpoint
}
