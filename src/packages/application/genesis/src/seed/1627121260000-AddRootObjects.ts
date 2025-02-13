import { TransformUtil } from '@ts-core/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { CompanyEntity, CompanyPreferencesEntity } from '@project/module/database/company';
import { Variables } from '@project/common/hlf';
import { CompanyPreferences, CompanyStatus, CompanyTaxDetails } from '@project/common/platform/company';
import * as _ from 'lodash';
import { ImageUtil } from '@project/module/util';

export class AddRootObjects1627121260000 implements MigrationInterface {

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async companyAdd(runner: QueryRunner): Promise<void> {
        let repository = runner.connection.getRepository(CompanyEntity);
        if (await repository.existsBy({ hlfUid: Variables.seed.user.uid })) {
            return;
        }
        let item = CompanyEntity.createEntity({ hlfUid: Variables.seed.user.uid, status: CompanyStatus.ACTIVE });
        item.details = TransformUtil.toClass(CompanyTaxDetails, { inn: '000000000000', founded: new Date(0) })
        item.preferences = CompanyPreferencesEntity.createEntity({ name: 'Platform company', picture: ImageUtil.getAvatar(Variables.seed.user.uid) });
        await item.save();
    }

    private async coinAdd(runner: QueryRunner): Promise<void> {
        /*
        let coin = new CoinEntity();
        coin.uid = AuctionVariable.coin.uid;
        coin.balance = CoinBalance.create();
        coin.balance.inUse = coin.balance.emitted = AuctionVariable.coin.amount;
        coin = await runner.connection.getRepository(CoinEntity).save(coin);

        let balance = new CoinBalanceEntity();
        balance.uid = AclVariables.root.uid;
        balance.held = '0';
        balance.coinUid = coin.uid;
        balance.inUse = balance.total = AuctionVariable.coin.amount;
        balance.coinId = coin.id;
        balance = await runner.connection.getRepository(CoinBalanceEntity).save(balance);
        */
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(runner: QueryRunner): Promise<any> {
        await this.companyAdd(runner);
        await this.coinAdd(runner);
    }

    public async down(runner: QueryRunner): Promise<any> { }
}
