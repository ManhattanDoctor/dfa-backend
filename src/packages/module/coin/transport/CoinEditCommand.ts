import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { Coin, CoinStatus } from '@project/common/platform/coin';
import { ICoinBalance } from '@hlf-core/coin';
import { ICoinPermission } from '@project/common/hlf/coin/permission';
import { ICoinData } from '@project/common/hlf/coin/data';

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

export interface ICoinEditDto {
    id: number | string;
    data?: ICoinData;
    hlfUid?: string;
    status?: CoinStatus;
    balance?: ICoinBalance;
    permissions?: Array<ICoinPermission>;
}