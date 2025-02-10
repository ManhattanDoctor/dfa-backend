import { Module } from '@nestjs/common';
import { TaxCompanyGetController } from './controller';
import { TaxService } from './service';

@Module({
    controllers: [TaxCompanyGetController],
    providers: [TaxService]
})
export class TaxModule { }