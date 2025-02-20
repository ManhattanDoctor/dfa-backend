import { Module } from '@nestjs/common';
import { CompanyAddController, CompanyGetController, CompanySubmitController, CompanyVerifyController, CompanyRejectController, CompanyEditController } from './controller';
import { CompanyEditHandler } from './transport/handler';

@Module({
    controllers: [CompanyAddController, CompanyGetController, CompanySubmitController, CompanyVerifyController, CompanyRejectController, CompanyEditController],
    providers: [CompanyEditHandler]
})
export class CompanyModule { }
