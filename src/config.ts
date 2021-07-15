import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '../.env'),
});

const PORT = process.env['PORT'];
const NODE_ENV = process.env['NODE_ENV'];
const JWT_SECRET_KEY = process.env['JWT_SECRET_KEY'];

export { PORT, NODE_ENV, JWT_SECRET_KEY };