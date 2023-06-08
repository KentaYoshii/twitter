variable "resource_prefix" {
  default = "intern-kentayoshii-tclone" // change-between 1 & 2
}

variable "ingress_cidr_blocks" {
  type = list(string)
  default = [
    "210.253.197.196/32",
    "210.253.209.177/32",
    "118.238.221.230/32",
    "54.249.20.115/32",
    "150.249.192.7/32",
    "150.249.202.244/32",
    "150.249.202.245/32",
    "150.249.202.253/32",
    "0.0.0.0/0"
  ]
}

variable "network_mode" {
  type    = string
  default = "awsvpc"
}

variable "role_arn" {
  type    = string
  default = "arn:aws:iam::741641693274:role/intern-devops-ecs"
}