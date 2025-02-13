import { Module } from '@nestjs/common';
import { CompanyGetController, CompanyEditController } from './controller';

@Module({
    controllers: [CompanyGetController, CompanyEditController],
})
export class CompanyModule { }
