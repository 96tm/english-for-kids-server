import express from 'express';

import cors from 'cors';

import { cloud_name, api_key, api_secret } from './config';

import { v2 as cloudinary } from 'cloudinary';

import { router as wordsRouter } from './routes/routes';

const app = express();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

console.log(cloud_name, api_key, api_secret);

app.use(
  cors({
    origin: 'http://localhost:4096',
  })
);

app.use('/words', wordsRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
