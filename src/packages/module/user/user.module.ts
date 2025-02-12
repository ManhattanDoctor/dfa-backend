import { Module } from '@nestjs/common';
import { UserGetController, UserEditController } from './controller';

@Module({
    controllers: [UserGetController, UserEditController],
})
export class UserModule { }
