import express from 'express';

import { StatusCodes } from 'http-status-codes';

import {
  getCategories,
  add as addCategory,
  deleteCategory,
  update,
} from './service';

import { isValidNumber } from '../util/util';

import { CATEGORIES_PER_PAGE } from '../../config';

const router = express.Router();

router.get('/', async (req, res) => {
  const page = (req.query?.page as string).trim();
  const limit = (req.query?.limit as string).trim();
  const pageNumber = isValidNumber(Number(page)) ? Number(page) : 1;
  const limitNumber = isValidNumber(Number(limit))
    ? Number(limit)
    : CATEGORIES_PER_PAGE;
  const categories = await getCategories(pageNumber, limitNumber);
  res.json(categories);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const category = await addCategory(name);
    res.status(StatusCodes.CREATED).json(category);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: `Invalid category data`,
    });
  }
});

router.delete('/:name', async (req, res) => {
  const name = req.params.name.trim();
  try {
    const category = await deleteCategory(name);
    res.json({ name: category.name, numberOfWords: category.words.length });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: `Invalid category data`,
    });
  }
});

router.put('/:name', async (req, res) => {
  try {
    const name = req.params.name.trim();
    const { newName } = req.body;
    const category = await update(name, newName);
    res.json(category);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: `Invalid category data`,
    });
  }
});

export { router };
