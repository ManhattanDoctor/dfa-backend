import { ActionType } from "@project/common/platform";
import { CoinEdited } from "./CoinEdited";

export class CoinHolded extends CoinEdited {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        this.type = ActionType.COIN_HOLDED;
        await super.execute();
    }
}