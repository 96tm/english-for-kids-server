import express from 'express';

import { StatusCodes } from 'http-status-codes';

import { getAll, add as addCategory, deleteCategory, update } from './service';

const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await getAll();
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
  const name = req.params.name as string;
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
    const name = req.params.name as string;
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
