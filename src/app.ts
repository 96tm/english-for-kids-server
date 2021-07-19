import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { v2 as cloudinary } from 'cloudinary';

import { cloud_name, api_key, api_secret } from './config';

import { router as wordsRouter } from './resources/word/router';
import { router as categoriesRouter } from './resources/category/router';
import { router as userRouter } from './resources/user/router';

import './db';

const app = express();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', userRouter);
app.use('/categories', categoriesRouter);
app.use('/categories', wordsRouter);

export default app;
