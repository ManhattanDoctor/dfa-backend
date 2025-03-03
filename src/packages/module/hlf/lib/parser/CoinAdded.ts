import { EventParser } from "../EventParser";
import { ActionType } from "@project/common/platform";
import { ICoinAddedEventDto } from "@project/common/hlf/transport";
import { CoinSynchronizeCommand } from "@project/module/coin/transport";
import * as _ from 'lodash';

export class CoinAdded extends EventParser<ICoinAddedEventDto, void, void> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let { coin, initiatorUid } = this.data;

        let details = { userUid: this.userId, coinUid: coin.uid, initiatorUid };
        this.actionAdd(ActionType.COIN_ADDED, coin.uid, details);
        this.actionAdd(ActionType.COIN_ADDED, this.userId, details);
        this.actionAdd(ActionType.COIN_ADDED, initiatorUid, details);

        this.commandAdd(new CoinSynchronizeCommand(coin.uid));
    }
}