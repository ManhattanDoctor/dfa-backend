import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { OpenIdSynchronizeCommand } from '../OpenIdSynchronizeCommand';
import { IOpenIdUser } from '@ts-core/openid-common';
import { DatabaseService } from '@project/module/database/service';
import { IOpenIdAttributes } from '../../lib';
import { OpenIdUpdateCommand } from '../OpenIdUpdateCommand';
import { UserNotFoundError } from '@project/common/platform';
import * as _ from 'lodash';

@Injectable()
export class OpenIdSynchronizeHandler extends TransportCommandAsyncHandler<string, IOpenIdUser, OpenIdSynchronizeCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService) {
        super(logger, transport, OpenIdSynchronizeCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string): Promise<IOpenIdUser> {
        let item = await this.database.userGet(params, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError(params);
        }
        let attributes: IOpenIdAttributes = { status: item.status };
        let { company } = item;
        if (!_.isNil(item.company)) {
            attributes.company = { id: company.id };
        }
        return this.transport.sendListen(new OpenIdUpdateCommand({ login: item.login, attributes }));
    }
}
