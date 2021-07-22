import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { v2 as cloudinary } from 'cloudinary';

import { cloud_name, api_key, api_secret } from './config';

import './db';

import { router as wordsRouter } from './resources/word/router';
import { router as categoriesRouter } from './resources/category/router';
import { router as userRouter } from './resources/user/router';

import { ErrorHandler } from './error-handling/ErrorHandler';
import { StatusCodes } from 'http-status-codes';
import CustomError from './error-handling/CustomError';

const app = express();
const errorHandler = new ErrorHandler();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (req.method === 'POST') {
    for (const [key, value] of Object.entries(req.body)) {
      req.body[key] = (value as string).trim();
    }
  }
  next();
});
app.use('/', userRouter);
app.use('/categories', categoriesRouter);
app.use('/categories', wordsRouter);
app.use((req, res, next) => {
  next(new CustomError(StatusCodes.NOT_FOUND, 'Page not found'));
});
app.use(errorHandler.handleError.bind(errorHandler));

export default app;
