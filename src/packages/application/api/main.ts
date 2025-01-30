import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DefaultLogger } from '@ts-core/backend-nestjs';
import { } from '@ts-core/backend-nestjs';
import { DateUtil } from '@ts-core/common';
import { HttpExceptionFilter, ExtendedErrorFilter, AllErrorFilter, ValidationExceptionFilter } from '@ts-core/backend-nestjs';
import { AppModule, AppSettings } from './src';
import { CoreExtendedErrorFilter } from '@project/module/core/middleware';
import { urlencoded, json } from 'express';
import * as compression from 'compression';
import * as nocache from 'nocache';
import helmet from 'helmet';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Bootstrap
//
// --------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));

    let application = await NestFactory.create(AppModule.forRoot(settings), { logger });
    application.useLogger(logger);
    application.use(helmet());
    application.use(nocache());
    application.use(compression());
    application.enableCors({ origin: true });
    application.useGlobalPipes(new ValidationPipe({ transform: true }));
    application.useGlobalFilters(new AllErrorFilter(new ValidationExceptionFilter(), new CoreExtendedErrorFilter(), new ExtendedErrorFilter(), new HttpExceptionFilter()));

    application.use(json({ limit: '50mb' }));
    application.use(urlencoded({ extended: true, limit: '50mb' }))

    const server = application.getHttpServer();
    server.setTimeout(10 * DateUtil.MILLISECONDS_MINUTE);

    await application.listen(settings.webPort);
    logger.log(`Listening "${settings.webPort}" port`);
}

bootstrap();
