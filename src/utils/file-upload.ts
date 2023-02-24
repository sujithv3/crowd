// created by vijay
// purpose : file uploaded

import { S3Client } from "@aws-sdk/client-s3";
const multer = require("multer");
const multer_s3 = require("multer-s3");

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

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
