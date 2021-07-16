import express from 'express';
import bcrypt from 'bcrypt';

import { UserModel } from './User';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  const user = await UserModel.findOne({ login });
  if (user) {
    const authResult = await bcrypt.compare(password, user.hash);
    console.log('auth result', authResult);
    if (authResult) {
      res.json({ message: 'Authenticated' });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        statusCode: StatusCodes.BAD_REQUEST,
        message: `Passwords don't match`,
      });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: `User ${login} not found`,
    });
  }
});

export { router };
