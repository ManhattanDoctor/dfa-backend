import { Controller, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { COMPANY_URL } from '@project/common/platform/api';
import { Company, CompanyStatus, CompanyUtil } from '@project/common/platform/company';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { CompanyEditCommand, ICompanyEditDto } from '../transport';
import { OpenIdService } from '@ts-core/openid-common';
import * as _ from 'lodash';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { KeyAddCommand, KeyGetByOwnerCommand } from '@project/module/custody/transport';
import { HlfUidUndefinedError } from '@project/common/platform';
import { HlfService } from '@project/module/hlf/service';
import { UserAddCommand } from '@project/common/hlf/transport';

@Controller(`${COMPANY_URL}/activate`)
export class CompanyActivateController extends DefaultController<void, Company> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private openId: OpenIdService, private hlf: HlfService) {
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

    private async activate(company: Company): Promise<ICompanyEditDto> {
        let { hlfUid } = company;
        if (_.isNil(hlfUid)) {
            let { algorithm, value } = await this.addKeyIfNeed(hlfUid);
            let { uid } = await this.hlf.sendListen(new UserAddCommand({ cryptoKey: { algorithm, value } }));
            hlfUid = uid;
        }
        return { id: company.id, status: CompanyStatus.ACTIVE, hlfUid };
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


        return this.transport.sendListen(new CompanyEditCommand(await this.activate(bearer.company)));
    }
}
