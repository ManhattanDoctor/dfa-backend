import { Module } from '@nestjs/common';
import { KeyGetController, KeyAddController, KeyListController } from './controller';
import { KeySignHandler, KeyAddHandler, KeyGetByOwnerHandler, KeyVerifyHandler } from './transport/handler';
import { KeyService } from './service';

@Module({
    //controllers: [KeyGetController, KeyAddController, KeyListController],
    providers: [KeySignHandler, KeyAddHandler, KeyGetByOwnerHandler, KeyVerifyHandler, KeyService]
})
export class CustodyModule { }