import express from 'express';
import jwt from 'jsonwebtoken';

import { StatusCodes } from 'http-status-codes';

import { JWT_SECRET_KEY } from '../config';

import { IUser, UserModel } from '../resources/user/User';
import CustomError from '../error-handling/CustomError';

class AuthService {
  static SCHEME = 'Bearer';

  static async checkAuth(login: string): Promise<IUser | null> {
    return UserModel.findOne({ login });
  }

  static async authenticate(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    if (req.method == 'OPTIONS') {
      next();
    } else {
      const [scheme, token] = String(req.get('authorization')).split(' ');

      if (!token || scheme !== AuthService.SCHEME) {
        next(new CustomError(StatusCodes.UNAUTHORIZED, 'Not token provided'));
      } else {
        jwt.verify(token, String(JWT_SECRET_KEY), async (err, decoded) => {
          if (err) {
            next(new CustomError(StatusCodes.UNAUTHORIZED, 'Not authorized'));
          } else {
            const user = await AuthService.checkAuth(
              String(decoded?.['userId'])
            );
            if (user) {
              next();
            } else {
              next(new CustomError(StatusCodes.FORBIDDEN, 'Not authorized'));
            }
          }
        });
      }
    }
  }
}

export { AuthService };
