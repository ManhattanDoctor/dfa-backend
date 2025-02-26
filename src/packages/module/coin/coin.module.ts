import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { CoinGetController, CoinBalanceListController, CoinBalanceGetController, CoinListController } from './controller';
import { CoinSynchronizeHandler, CoinBalanceSynchronizeHandler, CoinEditHandler, CoinBalanceEditHandler } from './transport/handler';

@Module({
    imports: [DatabaseModule],
    controllers: [
        CoinGetController,
        CoinListController,
        CoinBalanceGetController,
        CoinBalanceListController
    ],
    providers: [
        CoinEditHandler,
        CoinSynchronizeHandler,
        CoinBalanceEditHandler,
        CoinBalanceSynchronizeHandler,
    ]
})
export class CoinModule { }