import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { File } from "@koa/multer";
import sharp from "sharp";
import { unlinkSync } from "fs";

import { LfgError } from "@/exceptions";

const s3Client = new S3Client({ region: "eu-west-3" });

export const uploadFile = async (file: File, id: string) => {
  try {
    // convert to webp for reduce size
    const webp = sharp(file.path).webp({ quality: 80 });

    // upload to aws
    const filename = `images/${id}/${file.filename}.webp`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: "lfg-cdn",
        ACL: "public-read",
        ContentType: "image/webp",
        Key: filename,
        Body: webp,
      }),
    );

    // remove local file
    unlinkSync(file.path);

    return filename;
  } catch (error: any) {
    throw new LfgError("[aws]: failed to upload file", error);
  }
};

export const deleteFile = async (file: string) => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: "lfg-cdn", Key: file }));
  } catch (error: any) {
    throw new LfgError("[aws]: failed to delete file", error);
  }
};
