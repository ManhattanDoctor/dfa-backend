import { Injectable } from '@nestjs/common';
import { Logger, Transport, LoggerWrapper, ISignature, TransportCryptoManager, DateUtil, RandomUtil } from '@ts-core/common';
import { TransportSocket } from '@ts-core/socket-server';
import { HlfService } from '@project/module/hlf/service';
import * as _ from 'lodash';
import { AppSettings } from '../AppSettings';
import { CompanyEditCommand } from '@project/module/company/transport';
import { CompanyStatus } from '@project/common/platform/company';
import { UserAddCommand, UserGetCommand } from '@project/common/hlf/transport';
import { Variables } from '@project/common/hlf';
import { DatabaseService } from '@project/module/database/service';
import { OpenIdSynchronizeCommand } from '@project/module/openid/transport';
import { CoinBalanceEditCommand, CoinBalanceSynchronizeCommand, CoinSynchronizeCommand } from '@project/module/coin/transport';
import { LedgerBlockParseCommand } from '@hlf-explorer/monitor';


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
        private database: DatabaseService,
        private hlf: HlfService,
        private settings: AppSettings
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

        //this.transport.send(new OpenIdSynchronizeCommand('dd9c7f15-46d6-4159-a494-af9d7f84f6b9'));
        //this.transport.send(new LedgerBlockParseCommand({ number: 7 }));
        /*
       let item = await this.database.companyPlatformGet();
       let command = new UserGetCommand({ uid: item.hlfUid, details: ['cryptoKey'] });
       let manager = new KeyTransportCryptoManager(this.transport);

       console.log(item.uid);

       let signature = await TransportCryptoManager.sign(command, manager, { privateKey: item.uid, publicKey: item.uid });
       console.log(await TransportCryptoManager.verify(command, manager, signature));
       console.log(signature);
       */
        // await this.hlf.initialize();

        // console.log(await CompanyEntity.find());

        /*
        let item = new KeycloakAdministratorTransport(this.logger, {
            url: 'http://localhost:8080',
            realm: 'dfa',
            login: 'admin@admin.ru',
            password: '123',
            clientId: 'platform',
            clientSecret: 'lDfg6Unge3lpR9xJVuZIgfCZd3ArsXlr'
        });
        item.token = new KeycloakTokenManager();

        let items = await item.call(`admin/realms/dfa/users`);
        console.log(items);
        await item.userAttributesSet('renat.gubaev@mail.ru', { company: JSON.stringify({ id: 123, status: 'passed' }), kys: JSON.stringify({ status: 'not_passed' }) });
        */

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
        // console.log(await api.sendListen(new CoinEmitCommand({ coinUid: 'coin_user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000_0_FLAT.NF.KRON.9.6.43', amount: '1', objectUid: 'user_01738232707288_2020993ebd1f22fba31a488f8e86d8faa888f5b954994a3c7ef423f7bdfbe467' })));
        // console.log(await api.sendListen(new CoinTransferCommand({ coinUid: 'coin_user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000_2_USD', amount: '10', from: Variables.seed.user.uid, to: 'user_01738161119839_b4aa1951e35629ca62ab0a330df5a94bc01f48a8850b182e8a8e3c9fd9e36d47' })));
        // console.log(await api.sendListen(new CoinTransferCommand({ coinUid: 'coin_user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000_0_FLAT.NF.KRON.9.6.43', amount: '13', from: Variables.seed.user.uid, to: 'user_01738161119839_b4aa1951e35629ca62ab0a330df5a94bc01f48a8850b182e8a8e3c9fd9e36d47' })));
    }


}