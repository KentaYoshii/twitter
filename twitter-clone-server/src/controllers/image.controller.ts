import { Request, Response } from "express";
import { PutObjectCommandInput, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "../config";
import { s3Client } from "../storage/s3_init";
import { createPresignedUrl } from "../storage/s3_action";
import { updateUserProfileImage } from "../database/db_user";

export const setProfileImage = async (req: Request, res: Response) => {
  if (!req.session || !req.session.uid || !req.session.entityType) {
    res.status(500).send();
    return;
  }
  const { file } = req;
  if (!file) {
    res.status(400).send();
    return;
  }
  const { uid, entityType } = req.session;
  const { originalname } = file;
  const timestamp = Date.now().toString();
  const key = `profiles/${uid}-${timestamp}-${originalname}`;
  const params: PutObjectCommandInput = {
    Bucket: config.BUCKET_NAME,
    Key: key,
    Body: file.buffer,
  };
  try {
    const cmd = new PutObjectCommand(params);
    await s3Client.send(cmd);
    const suc = await updateUserProfileImage(key, uid, entityType);
    if (!suc) {
      res.status(500).send();
      return;
    }
    const presignedUrl = await createPresignedUrl(key);
    res.status(200).json({ location: presignedUrl });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
};
