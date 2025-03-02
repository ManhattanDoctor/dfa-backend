import { ActionType } from "@project/common/platform";
import { EventParser } from "../EventParser";
import { ICoinTransferEventDto } from "@hlf-core/coin";
import { CoinBalanceSynchronizeCommand, CoinSynchronizeCommand } from "@project/module/coin/transport";

export class CoinTransferred extends EventParser<ICoinTransferEventDto, void, void> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let { coinUid, from, to, initiatorUid } = this.data;
        await this.coinGet(coinUid);

        let details = { amount: this.data.amount, userUid: this.userId, coinUid, initiatorUid };
        this.actionAdd(ActionType.COIN_TRANSFER, initiatorUid, details);
        this.actionAdd(ActionType.COIN_TRANSFER_SENT, from, details);
        this.actionAdd(ActionType.COIN_TRANSFER_RECEIVE,to, details);

        this.commandAdd(new CoinSynchronizeCommand(coinUid));
        this.commandAdd(new CoinBalanceSynchronizeCommand({ objectUid: to, coinUid }));
        this.commandAdd(new CoinBalanceSynchronizeCommand({ objectUid: from, coinUid }));
    }
}