import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { Connection, DataSource, SelectQueryBuilder } from 'typeorm';
import { isUUID } from 'class-validator';
import { UserEntity } from '../user';
import * as _ from 'lodash';
import { CompanyEntity } from '@project/module/database/company';
import { CompanyStatus } from '@project/common/platform/company';
import { CompanyNotFoundError } from '@project/common/platform';

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
            throw new CompanyNotFoundError();
        }
        if (isNeedRelations) {
            this.companyAddRelations(query);
        }
        return query.getOne();
    }

    public async companyStatus(item: CompanyEntity, status: CompanyStatus): Promise<CompanyEntity> {
        item.status = status;
        return item.save();
    }

    public companyAddRelations<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('company.preferences', 'companyPreferences');
    }
}
