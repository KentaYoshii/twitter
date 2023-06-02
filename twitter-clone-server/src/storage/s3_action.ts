import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3_init";
import config from "../config";
import { ImageEntity } from "../models/ImageEntity";

export const createPresignedUrl = async (key: string) => {
  const cmd = new GetObjectCommand({
    Bucket: config.BUCKET_NAME,
    Key: key,
  });
  const res = await getSignedUrl(s3Client, cmd, { expiresIn: 36000 });
  return res;
};

const uploadSingleFile = async (file: Express.Multer.File, key: string) => {
  const params: PutObjectCommandInput = {
    Bucket: config.BUCKET_NAME,
    Key: key,
    Body: file.buffer,
  };
  try {
    const cmd = new PutObjectCommand(params);
    await s3Client.send(cmd);
  } catch (e) {
    console.log(e);
  }
};

export const uploadFiles = async (imageEntities: ImageEntity[]) => {
  const uploadPromises = imageEntities.map((imageEntity) => uploadSingleFile(imageEntity.file, imageEntity.key));
  try {
    await Promise.all(uploadPromises);
  } catch (e) {
    console.log(e);
  }

};