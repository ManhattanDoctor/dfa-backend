import { Injectable } from '@nestjs/common';
import { Logger, Transport, LoggerWrapper, TransportCryptoManagerEd25519, MathUtil } from '@ts-core/common';
import { TransportSocket } from '@ts-core/socket-server';
import { HlfService } from '@project/module/hlf/service';
import { LedgerBlockParseCommand } from '@hlf-explorer/monitor';
import { CoinEmitCommand, CoinTransferCommand, ICoinTransferDto } from '@hlf-core/coin';
import * as _ from 'lodash';
import { CoinAddCommand, ICoinAddDto, TestCommand, UserAddCommand } from '@project/common/hlf/transport';
import { UserRole } from '@project/common/hlf/user';
import { Variables } from '@project/common/hlf';
import { CoinType } from '@project/common/hlf/coin';

@Injectable()
export class InitializeService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------



    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(
        logger: Logger,
        private transport: Transport,
        private socket: TransportSocket,
        private hlf: HlfService
    ) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        await this.hlf.initialize();

        // this.transport.send(new LedgerBlockParseCommand({ number: 8 }));
        let api = this.hlf;

        api.setRoot();
        // console.log(await api.sendListen(new UserAddCommand({ cryptoKey: Variables.seed.cryptoKey, roles: [UserRole.COIN_MANAGER] })));

        /*
        console.log(await api.sendListen(new CoinAddCommand({
            type: CoinType.FT,
            ticker: 'USD',
            decimals: 2,
            emit: '12500',
            data: {
                name: 'Американский доллар'
            }
        })));
        */
        
        /*
        console.log(await api.sendListen(new CoinAddCommand({
            type: CoinType.NFT,
            ticker: 'FLAT',
            decimals: 0,
            data: {
                name: 'Квартира',
                country: 'Россия',
                city: 'Москва'
            },
            series: {
                uid: 'KRON.9.6',
                index: '43'
            }
        })));
        */
        
        console.log(await api.sendListen(new CoinEmitCommand({ coinUid: 'coin_user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000_0_FLAT.NF.KRON.9.6.43', amount: '1', objectUid: 'user_01738232707288_2020993ebd1f22fba31a488f8e86d8faa888f5b954994a3c7ef423f7bdfbe467' })));

        // console.log(await api.sendListen(new CoinTransferCommand({ coinUid: 'coin_user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000_2_USD', amount: '10', from: Variables.seed.user.uid, to: 'user_01738161119839_b4aa1951e35629ca62ab0a330df5a94bc01f48a8850b182e8a8e3c9fd9e36d47' })));
        // console.log(await api.sendListen(new CoinTransferCommand({ coinUid: 'coin_user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000_0_FLAT.NF.KRON.9.6.43', amount: '13', from: Variables.seed.user.uid, to: 'user_01738161119839_b4aa1951e35629ca62ab0a330df5a94bc01f48a8850b182e8a8e3c9fd9e36d47' })));
    }

 
}