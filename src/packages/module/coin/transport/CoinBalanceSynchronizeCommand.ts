import { TransportCommand } from '@ts-core/common';

export class CoinBalanceSynchronizeCommand extends TransportCommand<ICoinBalanceSynchronizeDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'CoinBalanceSynchronizeCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICoinBalanceSynchronizeDto) {
        super(CoinBalanceSynchronizeCommand.NAME, request);
    }
}

export interface ICoinBalanceSynchronizeDto {
    coinUid: string;
    objectUid: string;
}