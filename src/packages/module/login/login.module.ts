import { TransportModule } from '@ts-core/backend-nestjs';
import { LoginService } from './service';
import { Module } from '@nestjs/common';
import { LoginController, InitController } from './controller';

@Module({
    imports: [
        TransportModule
    ],
    providers: [LoginService],
    controllers: [LoginController, InitController]
})
export class LoginModule { }
