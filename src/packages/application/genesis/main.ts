import { NestFactory } from '@nestjs/core';
import { DefaultLogger } from '@ts-core/backend-nestjs';
import { } from '@ts-core/backend-nestjs';
import { AppModule, AppSettings } from './src';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Bootstrap
//
// --------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = settings.logger = new DefaultLogger(settings.loggerLevel);
    let application = await NestFactory.createApplicationContext(AppModule.forRoot(settings), { logger });
    application.useLogger(logger);
}

bootstrap();
