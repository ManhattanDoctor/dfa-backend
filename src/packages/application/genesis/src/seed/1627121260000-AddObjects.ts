import { TransformUtil } from '@ts-core/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { CompanyEntity, CompanyPreferencesEntity } from '@project/module/database/company';
import { Variables } from '@project/common/hlf';
import { CompanyStatus, CompanyTaxDetails } from '@project/common/platform/company';
import { CoinBalanceEntity, CoinEntity } from '@project/module/database/coin';
import { CoinBalance } from '@hlf-core/coin';
import { CoinStatus } from '@project/common/platform/coin';
import * as _ from 'lodash';

export class AddObjects1627121260000 implements MigrationInterface {

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

        let name = 'Platform';
        let item = CompanyEntity.createEntity({ hlfUid: Variables.seed.user.uid, status: CompanyStatus.ACTIVE });
        item.details = TransformUtil.toClass(CompanyTaxDetails, { inn: '000000000000', founded: new Date(0), name })
        item.preferences = CompanyPreferencesEntity.createEntity({ name });
        await item.save();
    }

    private async coinAdd(runner: QueryRunner): Promise<void> {
        let repository = runner.connection.getRepository(CoinEntity);
        if (await repository.existsBy({ hlfUid: Variables.seed.coin.uid })) {
            return;
        }

        let company = await runner.connection.getRepository(CompanyEntity).findOneByOrFail({ hlfUid: Variables.seed.user.uid });

        let coin = new CoinEntity();
        coin.status = CoinStatus.ACTIVE;
        coin.hlfUid = Variables.seed.coin.uid;
        coin.companyId = company.id;
        
        coin.balance = CoinBalance.create();
        coin.balance.emit(Variables.seed.coin.amount);
        await repository.save(coin);

        let balance = new CoinBalanceEntity();
        balance.held = '0';
        balance.inUse = balance.total = Variables.seed.coin.amount;
        balance.coinId = coin.id;
        balance.coinUid = coin.hlfUid;
        balance.objectUid = Variables.seed.coin.ownerUid;
        await runner.connection.getRepository(CoinBalanceEntity).save(balance);
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
