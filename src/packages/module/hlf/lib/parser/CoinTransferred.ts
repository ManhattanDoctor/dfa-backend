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
        let { coinUid } = this.data;
        await this.coinGet(coinUid);

        let details = { coinUid: this.data.coinUid, amount: this.data.amount, userUid: this.userId };
        this.actionAdd(ActionType.COIN_TRANSFER_SENT, this.data.from, details);
        this.actionAdd(ActionType.COIN_TRANSFER_RECEIVE, this.data.to, details);

        this.commandAdd(new CoinSynchronizeCommand(coinUid));
        this.commandAdd(new CoinBalanceSynchronizeCommand({ objectUid: this.data.to, coinUid }));
        this.commandAdd(new CoinBalanceSynchronizeCommand({ objectUid: this.data.from, coinUid }));
    }
}