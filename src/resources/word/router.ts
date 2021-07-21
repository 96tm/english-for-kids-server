import path from 'path';
import multer from 'multer';
import express from 'express';

import { promises as fs } from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';

import {
  getWords,
  add as addWord,
  deleteWord,
  update as updateWord,
} from './service';

import { IMAGE_URL_PREFIX, AUDIO_URL_PREFIX, VALID_STRING } from '../../config';
import { isValidNumber } from '../util/util';

const loader = multer({ dest: path.join(__dirname, 'tmp') });
const router = express.Router();

import { WORDS_PER_PAGE } from '../../config';
import { IWord } from './Word';
import IWordDTO from './IWordDTO';

router.get('/:category/words', async (req, res) => {
  const category = req.params.category.trim();
  const page = (req.query?.page as string).trim();
  const limit = (req.query?.limit as string).trim();
  const pageNumber = isValidNumber(Number(page)) ? Number(page) : 1;
  const limitNumber = isValidNumber(Number(limit))
    ? Number(limit)
    : WORDS_PER_PAGE;
  const words: IWord[] = await getWords(category, pageNumber, limitNumber);
  const DTOWords: IWordDTO[] = words.map((wordDocument) => {
    const { word, translation, audioSrc, image } = wordDocument;
    return { category, word, translation, audioSrc, image };
  });
  res.json(DTOWords);
});

router.delete('/:category/words/:word', async (req, res) => {
  const category = req.params.category.trim();
  const word = req.params.word.trim();
  try {
    const deletedWord = await deleteWord(category, word);
    const { word: foundWord, translation, imageSrc, audio } = deletedWord;
    res.json({ word: foundWord, translation, imageSrc, audio });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: `Invalid word data`,
    });
  }
  // const wordModel = await deleteWord(category.trim(), word.trim());
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
      const word = req.params.word.trim();
      const { category, word: newWord, translation } = req.body;
      if (
        !(
          VALID_STRING.test(word) &&
          VALID_STRING.test(newWord) &&
          VALID_STRING.test(category)
        )
      ) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          statusCode: StatusCodes.BAD_REQUEST,
          message: `All text data must contain only latin letters, digits, (, ), -, _ and spaces`,
        });
      }
      const imageFiles = files['image'];
      const audioFiles = files['audio'];
      let imagePath = null;
      let audioPath = null;
      if (imageFiles) {
        imagePath = imageFiles[0].path;
        cloudinary.uploader
          .upload(imagePath, {
            public_id: newWord,
            overwrite: true,
            invalidate: true,
          })
          .then(() => {
            fs.unlink(files['image'][0].path);
          })
          .catch((err) => {
            console.error(`Error during image upload: ${err}`);
          });
      }
      if (audioFiles) {
        audioPath = files['audio'][0].path;
        cloudinary.uploader
          .upload(audioPath, {
            public_id: newWord,
            resource_type: 'video',
            invalidate: true,
            overwrite: true,
          })
          .then(() => {
            fs.unlink(files['audio'][0].path);
          })
          .catch((err) => {
            console.error(`Error during image upload: ${err}`);
          });
      }

      const wordModel = await updateWord(word, {
        category,
        word: newWord,
        translation,
        audioSrc: audioFiles ? `${AUDIO_URL_PREFIX}${newWord}` : '',
        image: imageFiles ? `${IMAGE_URL_PREFIX}${newWord}.jpg` : '',
      });
      res.json(wordModel);
    } catch (error) {
      console.error('Word update error: ', error);
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        statusCode: StatusCodes.BAD_REQUEST,
        message: `Invalid word data`,
      });
    }
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
    let imageFiles = null;
    try {
      files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { category, word, translation } = req.body;
      if (!(VALID_STRING.test(word) && VALID_STRING.test(category))) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          statusCode: StatusCodes.BAD_REQUEST,
          message: `All text data must contain only latin letters and/or digits`,
        });
        return;
      }
      const audioPath = files['audio'][0].path;
      imageFiles = files['image'];
      let imagePath: string | null = null;
      if (imageFiles) {
        imagePath = imageFiles[0].path;
        cloudinary.uploader
          .upload(imagePath, {
            public_id: word,
            overwrite: true,
            invalidate: true,
          })
          .then(() => {
            fs.unlink(String(imagePath));
          })
          .catch((err) => {
            console.error(`Error during image upload: ${err}`);
          });
      }
      cloudinary.uploader
        .upload(audioPath, {
          resource_type: 'video',
          public_id: word,
          overwrite: true,
          invalidate: true,
        })
        .then(() => {
          fs.unlink(files['audio'][0].path);
        })
        .catch((err) => {
          console.error(`Error during audio upload: ${err}`);
        });
      const wordModel = await addWord({
        category,
        word,
        translation,
        audioSrc: `${AUDIO_URL_PREFIX}${word}`,
        image: imageFiles ? `${IMAGE_URL_PREFIX}${word}.jpg` : '',
      });
      res.json({
        ...wordModel,
      });
    } catch (error) {
      console.error('Word post error: ', error, error.name);
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        statusCode: StatusCodes.BAD_REQUEST,
        message: `Invalid word data`,
      });
    }
  }
);

export { router };
