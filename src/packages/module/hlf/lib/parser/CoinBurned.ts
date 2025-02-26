import { ActionType } from "@project/common/platform";
import { CoinEdited } from "./CoinEdited";

export class CoinBurned extends CoinEdited {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        this.type = ActionType.COIN_BURNED;
        await super.execute();
    }
}