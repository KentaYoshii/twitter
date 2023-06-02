import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import config from "../config";

let s3Config: S3ClientConfig = {};

if (config.NODE_ENV === "production") {
  s3Config = {
    region: config.S3_REGION,
    forcePathStyle: true,
  };
} else {
  s3Config = {
    endpoint: "http://localhost:9000",
    forcePathStyle: true,
    region: config.S3_REGION,
  };
}

export const s3Client = new S3Client(s3Config);
