import { MigrationInterface, QueryRunner } from 'typeorm';
import { LedgerBlockTransaction } from '@hlf-explorer/common';
import { TransformUtil } from '@ts-core/common';
import * as _ from 'lodash';

export class AddRootActions1627121260010 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(runner: QueryRunner): Promise<any> {
        /*
        let repository = runner.connection.getRepository(ActionEntity);
        if (await repository.count() > 0) {
            return;
        }

        let coin = await runner.connection.getRepository(CoinEntity).findOneByOrFail({ uid: AuctionVariable.coin.uid });
        let team = await runner.connection.getRepository(UserEntity).findOneByOrFail({ uid: AclVariables.team.uid });
        let root = await runner.connection.getRepository(UserEntity).findOneByOrFail({ uid: AclVariables.root.uid });
        let platform = await runner.connection.getRepository(UserEntity).findOneByOrFail({ uid: AclVariables.platform.uid });
        let nickname = await runner.connection.getRepository(NicknameEntity).findOneByOrFail({ uid: AclVariables.platform.nicknameUid });

        let items = new Array();
        let transaction = TransformUtil.toClass(LedgerBlockTransaction, { date: platform.created, validationCode: 0, requestId: AclVariables.transaction.hash, requestUserId: platform.uid });

        items.push(new ActionEntity(ActionType.USER_ADDED, root.uid, { userUid: root.uid }, transaction));
        items.push(new ActionEntity(ActionType.USER_ADDED, team.uid, { userUid: team.uid }, transaction));
        items.push(new ActionEntity(ActionType.USER_ADDED, platform.uid, { userUid: platform.uid }, transaction));

        items.push(new ActionEntity(ActionType.NICKNAME_ADDED, nickname.uid, { nicknameUid: nickname.uid }, transaction));

        items.push(new ActionEntity(ActionType.COIN_ADDED, coin.uid, { coinUid: coin.uid }, transaction));
        items.push(new ActionEntity(ActionType.COIN_EMITTED, root.uid, { coinUid: coin.uid, amount: AuctionVariable.coin.amount }, transaction));

        await repository.save(items);
        */
    }

    public async down(runner: QueryRunner): Promise<any> { }
}
