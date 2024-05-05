import { ConfigService } from '@app/config';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class FoundException extends HttpException {
  constructor(message = 'Found') {
    super(message, HttpStatus.FOUND);
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.redirect(this.configService.config.BULL_URL_PATH);
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(/*private readonly reflector: Reflector*/) {
    super();
  }

  handleRequest(err: Error, user: any, _info: any, context: any) {
    if (err || !user) {
      const response = context.switchToHttp().getResponse();

      // const isPublic = this.reflector.get<boolean>(
      //   'isPublic',
      //   context.getHandler(),
      // );
      // console.log({isPublic});
      //
      // if (isPublic) {
      //   return true;
      // }

      response.setHeader('location', 'login?invalid=true');
      throw new FoundException('redirecting you to login...');
    }
    return user;
  }

  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    await super.logIn(request);
    return result;
  }
}
