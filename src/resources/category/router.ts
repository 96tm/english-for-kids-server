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
  const category = await addCategory(name);
  res.status(StatusCodes.CREATED).json(category);
});

router.delete('/:name', async (req, res) => {
  const name = req.params.name as string;
  const category = deleteCategory(name);
  res.status(StatusCodes.NO_CONTENT).json(category);
});

router.put('/:name', async (req, res) => {
  const name = req.params.name as string;
  const { newName } = req.body;
  console.log(name, newName);

  const category = update(name, newName);
  res.status(StatusCodes.NO_CONTENT).json(category);
});

export { router };
