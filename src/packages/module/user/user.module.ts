import { Module } from '@nestjs/common';
import { UserGetController, UserEditController } from './controller';
import { UserEditHandler } from './transport/handler';

@Module({
    controllers: [UserGetController, UserEditController],
    providers: [UserEditHandler]
})
export class UserModule { }
