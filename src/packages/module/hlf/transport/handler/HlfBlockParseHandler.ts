import { Injectable } from '@nestjs/common';
import { Logger, ClassType, Transport } from '@ts-core/common';
import { LedgerApiClient } from '@hlf-explorer/common';
import { Event as CoinEvent } from '@hlf-core/coin';
import { LedgerDatabase, LedgerBlockParseHandler, LedgerEventParser, ILedgerBlockParserEffects } from '@hlf-explorer/monitor';
import { DatabaseService } from '@project/module/database/service';
import { TransportSocket } from '@ts-core/socket-server';
import { Event } from '@project/common/hlf/transport';
import { CoinAdded, CoinBurned, CoinEmitted, CoinHolded, CoinTransferred, CoinUnholded, UserAdded, UserEdited } from '../../lib/parser';
import * as _ from 'lodash';

@Injectable()
export class HlfBlockParseHandler extends LedgerBlockParseHandler {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, database: LedgerDatabase, api: LedgerApiClient, private databaseService: DatabaseService, private socket: TransportSocket) {
        super(logger, transport, database, api);


        this.parserAdd(Event.USER_ADDED, UserAdded);
        this.parserAdd(Event.USER_EDITED, UserEdited);

        this.parserAdd(Event.COIN_ADDED, CoinAdded);
        this.parserAdd(CoinEvent.COIN_HOLDED, CoinHolded);
        this.parserAdd(CoinEvent.COIN_BURNED, CoinBurned);
        this.parserAdd(CoinEvent.COIN_EMITTED, CoinEmitted);
        this.parserAdd(CoinEvent.COIN_UNHOLDED, CoinUnholded);
        this.parserAdd(CoinEvent.COIN_TRANSFERRED, CoinTransferred);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected createParser<T, U, V>(classType: ClassType<LedgerEventParser<U, T, V>>): LedgerEventParser<U, T, V> {
        return new classType(this.logger, this.api, this.databaseService);
    }

    protected async effects(data: ILedgerBlockParserEffects): Promise<void> {
        await super.effects(data);
        data.socketEvents.forEach(item => this.socket.dispatch(item.event, item.options));
    }
}