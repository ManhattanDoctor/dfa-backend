import { MigrationInterface, QueryRunner } from 'typeorm';
import * as _ from 'lodash';

export class AddRootObjects1627121260000 implements MigrationInterface {

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async userAdd(runner: QueryRunner): Promise<void> {
        /*
        let repository = runner.connection.getRepository(UserEntity);

        let platform = new UserEntity();
        platform.uid = User.createUid(AclVariables.platform.address);
        platform.status = UserStatus.ACTIVE;
        platform.address = AclVariables.platform.address;
        platform.inviterUid = AclVariables.platform.uid;
        platform.nicknameUid = AclVariables.platform.nicknameUid;
        await repository.save(platform);

        let team = new UserEntity();
        team.uid = User.createUid(AclVariables.team.address);
        team.status = UserStatus.ACTIVE;
        team.address = AclVariables.team.address;
        team.inviterUid = AclVariables.platform.uid;
        await repository.save(team);

        let root = new UserEntity();
        root.uid = User.createUid(AclVariables.root.address);
        root.roles = Object.values(UserRole);
        root.status = UserStatus.ACTIVE;
        root.address = AclVariables.root.address;
        root.inviterUid = AclVariables.platform.uid;
        await repository.save(root);
        */
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
        /*
        let repository = runner.connection.getRepository(UserEntity);
        if (await repository.count() > 0) {
            return;
        }
        await this.userAdd(runner);
        await this.coinAdd(runner);
        */
    }

    public async down(runner: QueryRunner): Promise<any> { }
}
