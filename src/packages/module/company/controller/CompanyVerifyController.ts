import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { ICompanyEditDtoResponse } from '@project/common/platform/api/company';
import { Company, CompanyStatus, CompanyUtil } from '@project/common/platform/company';
import { COMPANY_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { CompanyEditCommand } from '../transport';
import { DatabaseService } from '@project/module/database/service';
import { CompanyNotFoundError } from '@project/common/platform';
import { KeycloakService } from '@ts-core/openid-common';
import * as _ from 'lodash';

@Controller(`${COMPANY_URL}/:id/verify`)
export class CompanyVerifyController extends DefaultController<number, Company> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private openId: KeycloakService, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Company verify', response: Company })
    @Post()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICompanyEditDtoResponse> {
        let item = await this.database.companyGet(id, false);
        if (_.isNil(item)) {
            throw new CompanyNotFoundError(id);
        }
        CompanyUtil.isCanVerify(item, await this.openId.getResources(bearer.token.value), true);
        return this.transport.sendListen(new CompanyEditCommand({ id: bearer.company.id, status: CompanyStatus.VERIFIED }));
    }
}
