import { get } from "env-var";

const port = get("PORT").default(7000).asIntPositive();
const nodeEnv = get("NODE_ENV").required().asString();
const sessionSecret = get("SESSION_SECRET").required().asString();

const redirectURL =
  nodeEnv === "production"
    ? "https://kentayoshii.intern.aws.prd.demodesu.com"
    : "http://localhost:7000"; // changed from 7000

// DYNAMO
const dynamoSecAcKey = get("DYNAMODB_SECRET_ACCESS_KEY")
  .default("DUMMY")
  .asString();
const dynamoAcKeyId = get("DYNAMODB_ACCESS_KEY_ID").default("DUMMY").asString();
const tableName = get("TABLE_NAME").default("twitter-clone").asString();
const gsi1Name = get("GSI1_NAME").default("EntityIndex").asString();
const gsi2Name = get("GSI2_NAME").default("EntityValueIndex").asString();
const dynamodbRegion = get("DYNAMODB_REGION")
  .default("ap-northeast-1")
  .asString();

// S3
const bucketName = get("BUCKET_NAME").default("twitter-clone").asString();
const s3Region = get("S3_REGION").default("ap-northeast-1").asString();

// OICD
const googleClientId = get("GOOGLE_CLIENT_ID").required().asString();
const googleClientSecret = get("GOOGLE_CLIENT_SECRET").required().asString();
const googleRedirectURI = get("GOOGLE_REDIRECT_URI").required().asString();

const config = {
  PORT: port,
  REDIRECT_URL: redirectURL,
  NODE_ENV: nodeEnv,
  SESSION_SECRET: sessionSecret,
  DYNAMODB_REGION: dynamodbRegion,
  S3_REGION: s3Region,
  TABLE_NAME: tableName,
  BUCKET_NAME: bucketName,
  GSI1_NAME: gsi1Name,
  GSI2_NAME: gsi2Name,
  GOOGLE_CLIENT_ID: googleClientId,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
  GOOGLE_REDIRECT_URI: googleRedirectURI,
  DYNAMODB_SECRET_ACCESS_KEY: dynamoSecAcKey,
  DYNAMODB_ACCESS_KEY_ID: dynamoAcKeyId,
};

export default config;
