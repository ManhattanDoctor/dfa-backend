import { Module } from '@nestjs/common';
import { UserGetController, UserEditController, UserListController } from './controller';
import { UserEditHandler } from './transport/handler';

@Module({
    controllers: [UserGetController, UserEditController, UserListController],
    providers: [UserEditHandler]
})
export class UserModule { }
