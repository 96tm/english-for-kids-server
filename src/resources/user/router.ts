import express from 'express';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { StatusCodes } from 'http-status-codes';

import { UserModel } from './User';

import { ErrorHandler } from '../../error-handling/ErrorHandler';
import CustomError from '../../error-handling/CustomError';

import { JWT_SECRET_KEY } from '../../config';

import { AUTH_EXPIRATION_TIME } from '../../util/util';

import { AuthService } from '../../auth/service';

const handleErrors = ErrorHandler.handleErrors;

const router = express.Router();

router.post(
  '/login',
  handleErrors(async (req, res) => {
    const { login, password } = req.body;
    const user = await UserModel.findOne({ login });
    if (user) {
      const authResult = await bcrypt.compare(password, user.hash);
      if (authResult) {
        const token = jwt.sign({ login: user.login }, String(JWT_SECRET_KEY), {
          expiresIn: AUTH_EXPIRATION_TIME,
        });
        res.json({ login: user.login, message: 'Authenticated', token });
      } else {
        throw new CustomError(StatusCodes.BAD_REQUEST, `Passwords don't match`);
      }
    } else {
      throw new CustomError(StatusCodes.BAD_REQUEST, `User ${login} not found`);
    }
  })
);

router.get(
  '/logout',
  AuthService.authorize,
  handleErrors(async (req, res) => {
    res
      .clearCookie('token', { secure: true })
      .json({ message: 'You have been logged out' });
  })
);

export { router };
