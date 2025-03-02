import { Controller, Param, Get, UseGuards, ParseIntPipe } from '@nestjs/common';
import { COMPANY_URL } from '@project/common/platform/api';
import { Company } from '@project/common/platform/company';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { ICompanyGetDtoResponse } from '@project/common/platform/api/company';
import { OpenIdGuard, OpenIdResourcePermission, } from '@project/module/openid';
import { CompanyNotFoundError } from '@project/common/platform';
import { ResourcePermission } from '@project/common/platform';
import { TRANSFORM_SINGLE } from '@project/module/core';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COMPANY_URL}/:id`)
export class CompanyGetController extends DefaultController<number, ICompanyGetDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get company', response: Company })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.COMPANY_READ)
    @UseGuards(OpenIdGuard)
    public async execute(@Param('id', ParseIntPipe) id: number): Promise<ICompanyGetDtoResponse> {
        let item = await this.database.companyGet(id, true);
        if (_.isNil(item)) {
            throw new CompanyNotFoundError(id);
        }
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
