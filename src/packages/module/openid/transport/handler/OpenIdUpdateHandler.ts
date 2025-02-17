import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { IOpenIdUpdateDto, OpenIdUpdateCommand } from '../OpenIdUpdateCommand';
import { IOpenIdUser } from '@ts-core/openid-common';
import { OpenIdAdministratorTransport } from '../../service';
import * as _ from 'lodash';

@Injectable()
export class OpenIdUpdateHandler extends TransportCommandAsyncHandler<IOpenIdUpdateDto, IOpenIdUser, OpenIdUpdateCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private service: OpenIdAdministratorTransport) {
        super(logger, transport, OpenIdUpdateCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IOpenIdUpdateDto): Promise<IOpenIdUser> {
        return this.service.update(params.login, params.attributes);
    }
}
