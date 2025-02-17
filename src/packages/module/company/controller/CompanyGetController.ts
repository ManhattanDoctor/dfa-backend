import { Controller, Param, Get, UseGuards, ParseIntPipe } from '@nestjs/common';
import { COMPANY_URL } from '@project/common/platform/api';
import { Company } from '@project/common/platform/company';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { ICompanyGetDtoResponse } from '@project/common/platform/api/company';
import { IOpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { OpenIdBearer } from '@ts-core/backend-nestjs-openid';
import { OpenIdService } from '@ts-core/openid-common';
import { getResourceValidationOptions, ResourcePermission, CompanyNotFoundError } from '@project/common/platform';
import { TRANSFORM_ADMINISTRATOR, TRANSFORM_SINGLE } from '@project/module/core';
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

    constructor(logger: Logger, private database: DatabaseService, private openId: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async validate(id: number, bearer: IOpenIdBearer): Promise<void> {
        if (id === bearer.token.content.company?.id) {
            return;
        }
        await this.openId.validateResource(bearer.token.value, getResourceValidationOptions(ResourcePermission.COMPANY_READ));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get company', response: Company })
    @Get()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICompanyGetDtoResponse> {
        await this.validate(id, bearer);

        let item = await this.database.companyGet(id, true);
        if (_.isNil(item)) {
            throw new CompanyNotFoundError();
        }
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
