import express from 'express';

import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { add as addWord, deleteWord, update as updateWord } from './service';
import { getWords } from '../category/service';

import { StatusCodes } from 'http-status-codes';

const loader = multer({ dest: path.join(__dirname, 'tmp') });
const router = express.Router();

router.delete('/:category/words/:word', async (req, res) => {
  const { word } = req.params;
  const wordModel = await deleteWord(word);
  console.log('word deleted', wordModel);
  res.status(StatusCodes.NO_CONTENT).json(wordModel);
});

router.get('/:category/words', async (req, res) => {
  const category = req.params.category as string;
  const words = await getWords(category);
  console.log('got words', words);

  res.json(words);
});

router.put(
  '/:category/words/:word',
  loader.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req, res) => {
    let files: { [fieldname: string]: Express.Multer.File[] } = {};
    try {
      files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { word } = req.params;
      const { category, word: newWord, translation } = req.body;
      const imagePath = files['image'][0].path;
      const audioPath = files['audio'][0].path;
      console.log('updating', imagePath, audioPath, word, newWord);

      let imageResult = null;
      if (imagePath) {
        imageResult = await cloudinary.uploader.upload(imagePath);
      }
      const audioResult = await cloudinary.uploader.upload(audioPath, {
        resource_type: 'video',
      });
      const wordModel = await updateWord(word, {
        category,
        word: newWord,
        translation,
        audioSrc: audioResult.secure_url,
        image: imageResult ? imageResult.secure_url : '',
      });
      res.json(wordModel);
    } catch (error) {
      console.error('Word update error: ', error);
      res.send(error);
    }
    fs.unlink(files['image'][0].path);
    fs.unlink(files['audio'][0].path);
  }
);

router.post(
  '/:category/words',
  loader.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req, res) => {
    let files: { [fieldname: string]: Express.Multer.File[] } = {};
    try {
      files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { category, word, translation } = req.body;
      const imagePath = files['image'][0].path;
      const audioPath = files['audio'][0].path;
      let imageResult = null;
      if (imagePath) {
        imageResult = await cloudinary.uploader.upload(imagePath);
      }
      const audioResult = await cloudinary.uploader.upload(audioPath, {
        resource_type: 'video',
      });
      const wordModel = await addWord({
        category,
        word,
        translation,
        audioSrc: audioResult.secure_url,
        image: imageResult ? imageResult.secure_url : '',
      });
      res.json({
        ...wordModel,
      });
    } catch (error) {
      console.error('Word post error: ', error);
      res.send(error);
    }
    fs.unlink(files['image'][0].path);
    fs.unlink(files['audio'][0].path);
  }
);

export { router };
