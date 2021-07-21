import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '../.env'),
});

const PORT = process.env['PORT'];
const JWT_SECRET_KEY = process.env['JWT_SECRET_KEY'];
const MONGO_CONNECTION_STRING = String(process.env['MONGO_CONNECTION_STRING']);
const SALT_ROUNDS = Number(process.env['SALT_ROUNDS']);
const IMAGE_URL_PREFIX = 'https://res.cloudinary.com/rsschool/image/upload/';
const AUDIO_URL_PREFIX = 'https://res.cloudinary.com/rsschool/video/upload/';
const VALID_STRING = /^[a-zA-Z0-9 ()-_]+$/;
const CATEGORIES_PER_PAGE = 8;
const WORDS_PER_PAGE = 8;
const cloud_name = process.env['CLOUD_NAME'];
const api_key = process.env['API_KEY'];
const api_secret = process.env['API_SECRET'];

export {
  PORT,
  JWT_SECRET_KEY,
  MONGO_CONNECTION_STRING,
  SALT_ROUNDS,
  IMAGE_URL_PREFIX,
  AUDIO_URL_PREFIX,
  VALID_STRING,
  CATEGORIES_PER_PAGE,
  WORDS_PER_PAGE,
  cloud_name,
  api_key,
  api_secret,
};
