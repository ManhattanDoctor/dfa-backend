import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { SelectQueryBuilder } from 'typeorm';
import { isUUID } from 'class-validator';
import { UserEntity } from '../user';
import * as _ from 'lodash';

@Injectable()
export class DatabaseService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
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
        }
        return query.getOne();
    }

    public userRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('user.account', 'userAccount');
        query.leftJoinAndSelect('user.statistics', 'userStatistics');
        query.leftJoinAndSelect('user.preferences', 'userPreferences');
    }

}
