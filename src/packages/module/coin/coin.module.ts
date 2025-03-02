import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { CoinBalanceListController, CoinBalanceGetController, CoinAddController, CoinGetController, CoinActivateController, CoinSubmitController, CoinVerifyController, CoinRejectController, CoinEditController, CoinListController } from './controller';
import { CoinSynchronizeHandler, CoinBalanceSynchronizeHandler, CoinEditHandler, CoinBalanceEditHandler } from './transport/handler';

@Module({
    imports: [DatabaseModule],
    controllers: [
        CoinAddController, CoinActivateController, CoinGetController, CoinSubmitController, CoinVerifyController, CoinRejectController, CoinEditController, CoinListController, CoinBalanceGetController, CoinBalanceListController
    ],
    providers: [
        CoinEditHandler,
        CoinSynchronizeHandler,
        CoinBalanceEditHandler,
        CoinBalanceSynchronizeHandler,
    ]
})
export class CoinModule { }