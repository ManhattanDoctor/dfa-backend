import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { isUUID } from 'class-validator';
import { UserEntity } from '../user';
import { CompanyEntity } from '@project/module/database/company';
import { CompanyNotFoundError } from '@project/common/platform';
import { Variables } from '@project/common/hlf';
import * as _ from 'lodash';
import { CoinBalanceEntity, CoinEntity } from '../coin';

@Injectable()
export class DatabaseService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, public source: DataSource) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getUserQuery(idOrLogin: string): SelectQueryBuilder<UserEntity> {
        let query = UserEntity.createQueryBuilder('user');
        if (isUUID(idOrLogin, '4')) {
            query.where('user.id = :id', { id: idOrLogin });
        }
        else {
            query.where('user.login = :login', { login: idOrLogin });
        }
        return query;
    }

    // --------------------------------------------------------------------------
    //
    //  User Methods
    //
    // --------------------------------------------------------------------------

    public async userGet(idOrLogin: string, isNeedRelations: boolean): Promise<UserEntity> {
        let query = this.getUserQuery(idOrLogin);
        if (isNeedRelations) {
            this.userRelationsAdd(query);
            this.companyAddRelations(query)
        }
        return query.getOne();
    }

    public userRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('user.company', 'company');
        query.leftJoinAndSelect('user.preferences', 'userPreferences');
    }

    // --------------------------------------------------------------------------
    //
    //  Company Methods
    //
    // --------------------------------------------------------------------------

    public async companyGet(idOrHlfUid: string | number, isNeedRelations: boolean): Promise<CompanyEntity> {
        let query = CompanyEntity.createQueryBuilder('company');
        if (_.isNumber(idOrHlfUid)) {
            query.where(`company.id  = :id`, { id: idOrHlfUid });
        }
        else if (_.isString(idOrHlfUid)) {
            query.where(`company.hlfUid  = :hlfUid`, { hlfUid: idOrHlfUid });
        }
        else {
            throw new CompanyNotFoundError(idOrHlfUid);
        }
        if (isNeedRelations) {
            this.companyAddRelations(query);
        }
        return query.getOne();
    }

    public async companyPlatformGet(): Promise<CompanyEntity> {
        return this.companyGet(Variables.seed.user.uid, true);
    }

    public companyAddRelations<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('company.preferences', 'companyPreferences');
    }

    // --------------------------------------------------------------------------
    //
    //  Coin Methods
    //
    // --------------------------------------------------------------------------

    public async coinGet(idOrHlfUid: string | number, isNeedRelations: boolean): Promise<CoinEntity> {
        let query = CoinEntity.createQueryBuilder('coin');
        if (_.isNumber(idOrHlfUid)) {
            query.where('coin.id  = :id', { id: idOrHlfUid });
        }
        else if (_.isString(idOrHlfUid)) {
            query.where('coin.hlfUid  = :hlfUid', { hlfUid: idOrHlfUid });
        }
        if (isNeedRelations) {
            this.addCoinRelations(query);
        }
        return query.getOne();
    }

    public async coinBalanceGet(objectUid: string, coinUid: string): Promise<CoinBalanceEntity> {
        let query = CoinBalanceEntity.createQueryBuilder('coinBalance');
        query.where('coinBalance.objectUid = :objectUid', { objectUid });
        query.andWhere('coinBalance.coinUid = :coinUid', { coinUid });
        this.addCoinBalanceRelations(query);
        this.addCoinRelations(query);
        return query.getOne();
    }

    public addCoinRelations<T = any>(query: SelectQueryBuilder<T>): void { }

    public addCoinBalanceRelations<T = any>(query: SelectQueryBuilder<T>): void {
        // query.leftJoinAndSelect('coinBalance.coin', 'coin');
    }
}
