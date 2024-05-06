import 'source-map-support/register';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { LoggerService } from './logger';
import { OpenAPIModule } from './openapi/openapi.module';

async function bootstrap() {
  const logger = new LoggerService();
  logger.setContext(bootstrap.name);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });
  const configService: ConfigService = app.get(ConfigService);

  OpenAPIModule.setup('docs', app);
  app.setBaseViewsDir('views');
  app.setViewEngine('ejs');

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
      secret:
        configService.config.BULL_COOKIE_NAME || 'THE_REAL_BULL_COOKIE_NAME',
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new LocalAuthGuard(reflector));

  logger.log(`Listening on HTTP port ${configService.config.PORT}`);
  await app.listen(configService.config.PORT);
}

// uncaught redis or mutex issues should result in the process being restarted
process.on('uncaughtException', (err) => {
  console.error(err.name);
  console.error(err.stack);
  process.exit(1);
});

bootstrap().then((r) => r);
