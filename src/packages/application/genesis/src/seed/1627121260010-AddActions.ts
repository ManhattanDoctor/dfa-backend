import { MigrationInterface, QueryRunner } from 'typeorm';
import { LedgerBlockTransaction } from '@hlf-explorer/common';
import { TransformUtil } from '@ts-core/common';
import { ActionEntity } from '@project/module/database/action';
import { CompanyEntity } from '@project/module/database/company';
import { Variables } from '@project/common/hlf';
import { CoinEntity } from '@project/module/database/coin';
import { ActionType } from '@project/common/platform';
import * as _ from 'lodash';

export class AddActions1627121260010 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(runner: QueryRunner): Promise<any> {
        let repository = runner.connection.getRepository(ActionEntity);
        if (await repository.count() > 0) {
            return;
        }

        let coin = await runner.connection.getRepository(CoinEntity).findOneByOrFail({ hlfUid: Variables.seed.coin.uid });
        let company = await runner.connection.getRepository(CompanyEntity).findOneByOrFail({ hlfUid: Variables.seed.user.uid });
        let transaction = TransformUtil.toClass(LedgerBlockTransaction, { date: Variables.seed.transaction.date, validationCode: 0, requestId: Variables.seed.transaction.hash, requestUserId: company.hlfUid });

        let amount = Variables.seed.coin.amount;
        let coinUid = coin.hlfUid;
        let userUid = company.hlfUid;

        let items = [
            new ActionEntity(ActionType.USER_ADDED, userUid, { userUid }, transaction),

            new ActionEntity(ActionType.COIN_ADDED, userUid, { userUid, coinUid }, transaction),
            new ActionEntity(ActionType.COIN_EMITTED, userUid, { userUid, coinUid, amount }, transaction),

            new ActionEntity(ActionType.COIN_ADDED, coinUid, { userUid, coinUid }, transaction),
            new ActionEntity(ActionType.COIN_EMITTED, coinUid, { userUid, coinUid, amount }, transaction)
        ]
        await repository.save(items);
    }

    public async down(runner: QueryRunner): Promise<any> { }
}
