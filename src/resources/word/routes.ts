import express from 'express';

import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const loader = multer({ dest: path.join(__dirname, 'tmp') });
const router = express.Router();

router.post(
  '/',
  loader.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req, res) => {
    let files: { [fieldname: string]: Express.Multer.File[] } = {};
    try {
      files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageResult = await cloudinary.uploader.upload(
        String(files['image'][0].path)
      );
      const audioResult = await cloudinary.uploader.upload(
        String(files['audio'][0].path),
        { resource_type: 'video' }
      );
      console.log('result', imageResult, audioResult);
      res.json({
        image: imageResult.secure_url,
        audio: audioResult.secure_url,
      });
    } catch (error) {
      console.error('error', error);
      res.send(error);
    }
    fs.unlink(files['image'][0].path);
    fs.unlink(files['audio'][0].path);
  }
);

export { router };
