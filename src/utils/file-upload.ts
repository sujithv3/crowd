// created by vijay
// purpose : file uploaded

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
const multer = require("multer");
const multer_s3 = require("multer-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// delete object

export const deleteS3BucketValues = async (key: any) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${key}`,
      })
    );
  } catch (error) {
    console.log(error);
  }
};

// file upload
export const upload = multer({
  storage: multer_s3({
    bucket: process.env.S3_BUCKET_NAME,
    s3: s3,
    acl: "public-read",
    contentType: multer_s3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});
