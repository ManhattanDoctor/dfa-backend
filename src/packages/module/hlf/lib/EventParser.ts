import { Logger } from '@ts-core/common';
import { LedgerApiClient } from '@hlf-explorer/common';
import { ActionType } from '@project/common/platform';
import { DatabaseService } from '@project/module/database/service';
import { LedgerEventParser } from "@hlf-explorer/monitor";
import { UserEntity } from '@project/module/database/user';
import { CoinEntity } from '@project/module/database/coin';
import { CompanyEntity } from '@project/module/database/company';
import { ActionEntity } from '@project/module/database/action';
import * as _ from 'lodash';

export abstract class EventParser<T, U, V> extends LedgerEventParser<T, U, V> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, api: LedgerApiClient, protected database: DatabaseService) {
        super(logger, api);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected abstract execute(): Promise<void>;

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    protected userGet(initiatorUid: string): Promise<UserEntity> {
        return UserEntity.findOneByOrFail({ uid: initiatorUid });
    }

    protected coinGet(hlfUid: string): Promise<CoinEntity> {
        return CoinEntity.findOneByOrFail({ hlfUid });
    }

    protected companyGet(hlfUid: string): Promise<CompanyEntity> {
        return CompanyEntity.findOneByOrFail({ hlfUid });
    }

    protected actionAdd(type: ActionType, objectUid: string, details?: Partial<ActionEntity>): void {
        this.entityAdd(new ActionEntity(type, objectUid, details, this.transaction, this.uid));
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();
        this.database = null;
    }
}