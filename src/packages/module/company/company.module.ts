import { Module } from '@nestjs/common';
import { CompanyAddController, CompanyGetController, CompanySubmitController, CompanyVerifyController, CompanyRejectController, CompanyEditController, CompanyListController } from './controller';
import { CompanyEditHandler } from './transport/handler';

@Module({
    controllers: [CompanyAddController, CompanyGetController, CompanySubmitController, CompanyVerifyController, CompanyRejectController, CompanyEditController, CompanyListController],
    providers: [CompanyEditHandler]
})
export class CompanyModule { }
