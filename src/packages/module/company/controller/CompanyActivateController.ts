import { Controller, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, ObjectUtil, Transport } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { COMPANY_URL } from '@project/common/platform/api';
import { Company, CompanyStatus, CompanyUtil } from '@project/common/platform/company';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { CompanyEditCommand, ICompanyEditDto } from '../transport';
import { OpenIdService } from '@ts-core/openid-common';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { KeyAddCommand, KeyGetByOwnerCommand } from '@project/module/custody/transport';
import { HlfService } from '@project/module/hlf/service';
import { UserAddCommand } from '@project/common/hlf/transport';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@Controller(`${COMPANY_URL}/activate`)
export class CompanyActivateController extends DefaultController<void, Company> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private openId: OpenIdService, private hlf: HlfService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async addKeyIfNeed(owner: string): Promise<Key> {
        let item = await this.transport.sendListen(new KeyGetByOwnerCommand(owner))
        if (_.isNil(item)) {
            item = await this.transport.sendListen(new KeyAddCommand({ algorithm: KeyAlgorithm.ED25519, owner }));
        }
        return item;
    }

    private async activate(bearer: IOpenIdBearer): Promise<ICompanyEditDto> {
        let { user, company } = bearer;
        if (_.isNil(company.hlfUid)) {
            this.hlf.signer = await this.database.companyPlatformGet();

            let key = await this.addKeyIfNeed(company.uid);
            let { uid } = await this.hlf.sendListen(new UserAddCommand({ initiatorUid: user.uid, cryptoKey: { algorithm: key.algorithm, value: key.value } }));
            company.hlfUid = uid;
        }
        return { id: company.id, status: CompanyStatus.ACTIVE, hlfUid: company.hlfUid };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Company activate', response: Company })
    @Post()
    @OpenIdGetUserInfo()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@OpenIdBearer() bearer: IOpenIdBearer): Promise<Company> {
        CompanyUtil.isCanActivate(bearer.company, await this.openId.getResources(bearer.token.value), true);
        return this.transport.sendListen(new CompanyEditCommand(await this.activate(bearer)));
    }
}
