import express from 'express';

import { StatusCodes } from 'http-status-codes';

import {
  getCategories,
  add as addCategory,
  deleteCategory,
  update,
} from './service';

import {
  isValidNumber,
  MONGO_DUPLICATION_ERROR_CODE,
  checkStrings,
  ACCEPTABLE_CHARACTERS,
} from '../../util/util';

import { CATEGORIES_PER_PAGE } from '../../config';

import { ErrorHandler } from '../../error-handling/ErrorHandler';
import CustomError from '../../error-handling/CustomError';
import { AuthService } from '../../auth/service';

const router = express.Router();

const handleErrors = ErrorHandler.handleErrors;

router.get(
  '/',
  handleErrors(async (req, res) => {
    const page = (req.query?.page as string).trim();
    const limit = (req.query?.limit as string).trim();
    const pageNumber = isValidNumber(Number(page)) ? Number(page) : 1;
    const limitNumber = isValidNumber(Number(limit))
      ? Number(limit)
      : CATEGORIES_PER_PAGE;
    const categories = await getCategories(pageNumber, limitNumber);
    res.json(categories);
  })
);

router.post(
  '/',
  AuthService.authorize,
  handleErrors(async (req, res) => {
    const { name } = req.body;
    try {
      const category = await addCategory(name);
      if (!checkStrings(name)) {
        throw new CustomError(
          StatusCodes.BAD_REQUEST,
          `Category name must contain only ${ACCEPTABLE_CHARACTERS}`
        );
      }
      res.status(StatusCodes.CREATED).json(category);
    } catch (err) {
      console.error('Category creation error:', err);
      let errorMessage = 'Invalid category data';
      if (err.code === MONGO_DUPLICATION_ERROR_CODE) {
        errorMessage = `Category "${name} already exists"`;
      }
      throw new CustomError(StatusCodes.BAD_REQUEST, errorMessage);
    }
  })
);

router.delete(
  '/:name',
  AuthService.authorize,
  handleErrors(async (req, res) => {
    const name = req.params.name.trim();
    try {
      const category = await deleteCategory(name);
      res.json({ name: category.name, numberOfWords: category.words.length });
    } catch (err) {
      console.error('Category deletion error:', err);
      throw new CustomError(StatusCodes.BAD_REQUEST, 'Invalid category data');
    }
  })
);

router.put(
  '/:name',
  AuthService.authorize,
  handleErrors(async (req, res) => {
    const name = req.params.name.trim();
    const { newName } = req.body;
    try {
      if (!checkStrings(name, newName)) {
        throw new CustomError(
          StatusCodes.BAD_REQUEST,
          `Category name must contain only ${ACCEPTABLE_CHARACTERS}`
        );
      }
      const category = await update(name, newName);
      res.json(category);
    } catch (err) {
      console.error('Category update error:', err);
      let errorMessage = 'Invalid category data';
      if (err.code === MONGO_DUPLICATION_ERROR_CODE) {
        errorMessage = `Category "${newName}" already exists"`;
      }
      throw new CustomError(StatusCodes.BAD_REQUEST, errorMessage);
    }
  })
);

export { router };
