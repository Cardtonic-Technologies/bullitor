import { ConfigService } from '@app/config';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// used the middleware as medium to block bull-board
// from rendering, and routing it through the AuthGuard
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  // private readonly username = 'user';
  // private readonly password = 'password';
  // private readonly encodedCreds = Buffer.from(
  //   this.username + ':' + this.password,
  // ).toString('base64');

  use(req: Request, res: Response, next: NextFunction) {
    // console.log('basic auth', {
    //   isAuth: req?.isAuthenticated(),
    //   isUnAuth: req?.isUnauthenticated(),
    // });

    if (!this.configService.config.BULL_ENABLE_AUTH) {
      return next();
    }

    if (req?.isAuthenticated()) {
      return next();
    }

    res.redirect('/auth/login?invalid=false');

    // return res.render('login', { invalid: req.query.invalid === 'true' });
    // const reqCreds = req.get('authorization')?.split('Basic ')?.[1] ?? null;
    //
    // if (!reqCreds || reqCreds !== this.encodedCreds) {
    //   res.setHeader(
    //     'WWW-Authenticate',
    //     'Basic realm="Your realm", charset="UTF-8"',
    //   );
    //   res.sendStatus(401);
    // } else {
    //   next();
    // }
  }
}
