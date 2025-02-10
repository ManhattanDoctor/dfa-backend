import { Module } from '@nestjs/common';
import { KeyGetController, KeyAddController, KeyListController } from './controller';
import { KeySignHandler, KeyAddHandler, KeyGetByOwnerHandler } from './transport/handler';
import { KeyService } from './service';

@Module({
    controllers: [KeyGetController, KeyAddController, KeyListController],
    providers: [KeySignHandler, KeyAddHandler, KeyGetByOwnerHandler, KeyService]
})
export class CustodyModule { }