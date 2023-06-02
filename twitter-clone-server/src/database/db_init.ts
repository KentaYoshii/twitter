import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import config from "../config";

let dynamoConfig: DynamoDBClientConfig = {};

if (config.NODE_ENV === "production") {
  dynamoConfig = {
    region: config.DYNAMODB_REGION,
  };
} else {
  dynamoConfig = {
    region: config.DYNAMODB_REGION,
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: config.DYNAMODB_ACCESS_KEY_ID,
      secretAccessKey: config.DYNAMODB_SECRET_ACCESS_KEY,
    },
  };
}

export const dynamoClient = new DynamoDBClient(dynamoConfig);
export const documentClient = DynamoDBDocumentClient.from(dynamoClient);
