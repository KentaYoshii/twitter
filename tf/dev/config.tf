terraform {
  backend "s3" {
    bucket  = "intern-kentayoshii"
    key     = "tclone.tfstate" //change between mission 1 & 2
    region  = "ap-northeast-1"
    encrypt = "true"
  }
}

provider "aws" {
  region = "ap-northeast-1"
  default_tags {
    tags = {
      Project = "kentayoshii"
    }
  }
}