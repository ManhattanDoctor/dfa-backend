import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { Coin } from '@project/common/platform/coin';

export class CoinEditCommand extends TransportCommandAsync<ICoinEditDto, Coin> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'CoinEditCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICoinEditDto) {
        super(CoinEditCommand.NAME, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(value: Coin): Coin {
        return TransformUtil.toClass(Coin, value);
    }
}

export type ICoinEditDto = Partial<Coin>;
