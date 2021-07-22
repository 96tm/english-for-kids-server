import path from 'path';
import multer from 'multer';
import express from 'express';

import { StatusCodes } from 'http-status-codes';

import {
  getWords,
  add as addWord,
  deleteWord,
  update as updateWord,
} from './service';

import { IMAGE_URL_PREFIX, AUDIO_URL_PREFIX } from '../../config';
import {
  isValidNumber,
  checkStrings,
  uploadFile,
  MONGO_DUPLICATION_ERROR_CODE,
  ACCEPTABLE_CHARACTERS,
} from '../../util/util';

import { WORDS_PER_PAGE } from '../../config';
import { IWord } from './Word';
import IWordDTO from './IWordDTO';

import { ErrorHandler } from '../../error-handling/ErrorHandler';
import CustomError from '../../error-handling/CustomError';

import { AuthService } from '../../auth/service';

const loader = multer({ dest: path.join(__dirname, 'tmp') });

const router = express.Router();

const handleErrors = ErrorHandler.handleErrors;

router.get(
  '/:category/words',
  handleErrors(async (req, res) => {
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
  })
);

router.delete(
  '/:category/words/:word',
  AuthService.authorize,
  handleErrors(async (req, res) => {
    const category = req.params.category.trim();
    const word = req.params.word.trim();
    try {
      const deletedWord = await deleteWord(category, word);
      const { word: foundWord, translation, imageSrc, audio } = deletedWord;
      res.json({ word: foundWord, translation, imageSrc, audio });
    } catch (err) {
      console.error('Word deletion error:', err);
      throw new CustomError(StatusCodes.BAD_REQUEST, 'Invalid word data');
    }
  })
);

router.put(
  '/:category/words/:word',
  loader.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  AuthService.authorize,
  handleErrors(async (req, res) => {
    let files: { [fieldname: string]: Express.Multer.File[] } = {};
    const word = req.params.word.trim();
    const { category, word: newWord, translation } = req.body;
    try {
      files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!checkStrings(word, newWord, category)) {
        throw new CustomError(
          StatusCodes.BAD_REQUEST,
          `Word and category must contain only ${ACCEPTABLE_CHARACTERS}`
        );
      }
      const imageFiles = files['image'];
      const audioFiles = files['audio'];
      let imagePath: string | null = null;
      let audioPath: string | null = null;
      if (imageFiles?.[0]) {
        imagePath = imageFiles[0].path;
        uploadFile(imagePath, newWord);
      }
      if (audioFiles?.[0]) {
        audioPath = audioFiles[0].path;
        uploadFile(audioPath, newWord, 'video');
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
      let errorMessage = 'Invalid word data';
      if (error.code === MONGO_DUPLICATION_ERROR_CODE) {
        errorMessage = `Word "${newWord}" already exists`;
      }
      throw new CustomError(StatusCodes.BAD_REQUEST, errorMessage);
    }
  })
);

router.post(
  '/:category/words',
  loader.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  AuthService.authorize,
  handleErrors(async (req, res) => {
    let files: { [fieldname: string]: Express.Multer.File[] } = {};
    let imageFiles = null;
    const { category, word, translation } = req.body;
    try {
      files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!checkStrings(word, category)) {
        throw new CustomError(
          StatusCodes.BAD_REQUEST,
          `Word and category must contain only ${ACCEPTABLE_CHARACTERS}`
        );
      }
      const audioPath = files['audio'][0].path;
      imageFiles = files['image'];
      let imagePath: string | null = null;
      if (imageFiles) {
        imagePath = imageFiles[0].path;
        uploadFile(imagePath, word);
      }
      uploadFile(audioPath, word, 'video');
      const wordModel = await addWord({
        category,
        word,
        translation,
        audioSrc: `${AUDIO_URL_PREFIX}${word}`,
        image: imageFiles ? `${IMAGE_URL_PREFIX}${word}.jpg` : '',
      });
      res.json(wordModel);
    } catch (error) {
      console.error('Word creation error: ', error.name, error.code);
      let errorMessage = 'Invalid word data';
      if (error.code === MONGO_DUPLICATION_ERROR_CODE) {
        errorMessage = `Word "${word}" already exists`;
      }
      throw new CustomError(StatusCodes.BAD_REQUEST, errorMessage);
    }
  })
);

export { router };
