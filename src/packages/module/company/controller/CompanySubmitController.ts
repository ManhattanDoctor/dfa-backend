import { Controller, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { COMPANY_URL } from '@project/common/platform/api';
import { Company, CompanyStatus, CompanyUtil } from '@project/common/platform/company';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { CompanyEditCommand } from '../transport';
import { OpenIdService } from '@ts-core/openid-common';
import * as _ from 'lodash';

@Controller(`${COMPANY_URL}/submit`)
export class CompanySubmitController extends DefaultController<void, Company> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private openId: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Company to verify', response: Company })
    @Post()
    @OpenIdGetUserInfo()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@OpenIdBearer() bearer: IOpenIdBearer): Promise<Company> {
        CompanyUtil.isCanSubmit(bearer.company, await this.openId.getResources(bearer.token.value), true);
        return this.transport.sendListen(new CompanyEditCommand({ id: bearer.company.id, status: CompanyStatus.VERIFICATION_PROCESS }));
    }
}
