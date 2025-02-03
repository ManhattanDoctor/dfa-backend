import { TransportModule } from '@ts-core/backend-nestjs';
import { DatabaseModule } from '../database';
import { LoginService } from './service';
import { Module } from '@nestjs/common';
import { LoginController, InitController } from './controller';

@Module({
    imports: [
        DatabaseModule,
        TransportModule
    ],
    providers: [LoginService],
    controllers: [LoginController, InitController]
})
export class LoginModule { }
