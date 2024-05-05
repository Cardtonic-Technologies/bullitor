import { ConfigService } from '@app/config';
import {
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('login')
  // @Render('login')
  login(@Request() req, @Response() res) {
    if (!this.configService.config.BULL_ENABLE_AUTH) {
      return res.redirect(this.configService.config.BULL_URL_PATH);
    }

    if (req?.isAuthenticated()) {
      return res.redirect(this.configService.config.BULL_URL_PATH);
    }

    return res.render('login', { invalid: req.query.invalid === 'true' });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  postLogin(@Response() res) {
    return res.redirect(this.configService.config.BULL_URL_PATH);
  }
}
