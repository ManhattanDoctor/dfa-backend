import { TransportCommandAsync } from '@ts-core/common';
import { IOpenIdUser } from '@ts-core/openid-common';

export class OpenIdSynchronizeCommand extends TransportCommandAsync<string, IOpenIdUser> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'OpenIdSynchronizeCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: string) {
        super(OpenIdSynchronizeCommand.NAME, request);
    }
}