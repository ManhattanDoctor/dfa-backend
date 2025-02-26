import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { CoinBalance } from '@project/common/platform/coin';

export class CoinBalanceEditCommand extends TransportCommandAsync<ICoinBalanceEditDto, CoinBalance> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'CoinBalanceEditCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICoinBalanceEditDto) {
        super(CoinBalanceEditCommand.NAME, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(value: CoinBalance): CoinBalance {
        return TransformUtil.toClass(CoinBalance, value);
    }
}

export interface ICoinBalanceEditDto {
    id: number;
    held?: string;
    inUse?: string;
    total?: string;
}