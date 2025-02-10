import { Controller, Param, Get, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { TaxService } from '../service';
import { OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { OpenIdGuard } from '@project/module/openid';
import { TAX_COMPANY_URL } from '@project/common/platform/api';
import { ITaxCompanyGetDtoResponse } from '@project/common/platform/api/tax';
import { CompanyTaxDetails } from '@project/common/platform/company';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${TAX_COMPANY_URL}/:value`)
export class TaxCompanyGetController extends DefaultController<string, ITaxCompanyGetDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: TaxService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get company in tax service', response: CompanyTaxDetails })
    @Get()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async execute(@Param('value') value: string): Promise<ITaxCompanyGetDtoResponse> {
        return this.service.getCompany(value);
    }
}
