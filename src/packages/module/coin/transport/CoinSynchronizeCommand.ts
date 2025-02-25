import { TransportCommand } from '@ts-core/common';

export class CoinSynchronizeCommand extends TransportCommand<string> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'CoinUpdateCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: string) {
        super(CoinSynchronizeCommand.NAME, request);
    }
}