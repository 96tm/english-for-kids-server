import express from 'express';

import cors from 'cors';

import bodyParser from 'body-parser';

import { cloud_name, api_key, api_secret } from './config';

import { v2 as cloudinary } from 'cloudinary';

import { router as wordsRouter } from './resources/word/routes';
import { router as categoriesRouter } from './resources/category/routes';

import './db';

const app = express();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

app.use(
  cors({
    origin: 'http://localhost:4096',
  })
);

app.use(bodyParser.json());

app.use('/words', wordsRouter);
app.use('/categories', categoriesRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
