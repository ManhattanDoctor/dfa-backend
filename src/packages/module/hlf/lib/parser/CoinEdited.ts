import { ActionType } from "@project/common/platform";
import { EventParser } from "../EventParser";
import { CoinBalanceSynchronizeCommand, CoinSynchronizeCommand } from "@project/module/coin/transport";
import { ICoinEditedEventDto } from "@hlf-core/coin";

export class CoinEdited extends EventParser<ICoinEditedEventDto, void, void> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected type: ActionType;

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let { coinUid, objectUid } = this.data;
        await this.coinGet(coinUid);

        let details = { amount: this.data.amount, coinUid };
        this.actionAdd(this.type, coinUid, details);
        this.actionAdd(this.type, objectUid, details);

        this.commandAdd(new CoinSynchronizeCommand(coinUid));
        this.commandAdd(new CoinBalanceSynchronizeCommand({ objectUid, coinUid }));
    }
}