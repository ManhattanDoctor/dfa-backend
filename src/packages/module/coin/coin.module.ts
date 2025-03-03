import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { CoinBalanceListController, CoinRemoveController, CoinBalanceGetController, CoinAddController, CoinGetController, CoinActivateController, CoinSubmitController, CoinVerifyController, CoinRejectController, CoinEditController, CoinListController } from './controller';
import { CoinSynchronizeHandler, CoinBalanceSynchronizeHandler, CoinEditHandler, CoinBalanceEditHandler } from './transport/handler';

@Module({
    imports: [DatabaseModule],
    controllers: [
        CoinAddController, CoinEditController, CoinRemoveController, CoinActivateController, CoinGetController, CoinSubmitController, CoinVerifyController, CoinRejectController, CoinListController, CoinBalanceGetController, CoinBalanceListController
    ],
    providers: [
        CoinEditHandler,
        CoinSynchronizeHandler,
        CoinBalanceEditHandler,
        CoinBalanceSynchronizeHandler,
    ]
})
export class CoinModule { }