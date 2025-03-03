import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { ICompanyEditDto, CompanyEditCommand } from '../CompanyEditCommand';
import { DatabaseService } from '@project/module/database/service';
import { Company } from '@project/common/platform/company';
import { getSocketCompanyRoom, CompanyNotFoundError, CompanyUndefinedError } from '@project/common/platform';
import { TransportSocket } from '@ts-core/socket-server';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { CompanyChangedEvent } from '@project/common/platform/transport';
import * as _ from 'lodash';
import { ObjectUtil } from '@project/common/platform/util';

@Injectable()
export class CompanyEditHandler extends TransportCommandAsyncHandler<ICompanyEditDto, Company, CompanyEditCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private socket: TransportSocket, private database: DatabaseService) {
        super(logger, transport, CompanyEditCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ICompanyEditDto): Promise<Company> {
        let { id } = params;
        if (_.isNil(id)) {
            throw new CompanyUndefinedError();
        }
        let item = await this.database.companyGet(id, true);
        if (_.isNil(item)) {
            throw new CompanyNotFoundError(id);
        }

        let isChanged = ObjectUtil.copy(params, item);
        if (ObjectUtil.copy(params.preferences, item.preferences)) {
            isChanged = true;
        }
        if (isChanged) {
            await item.save();
        }

        let value = item.toObject({ groups: TRANSFORM_SINGLE });
        if (isChanged) {
            this.socket.dispatch(new CompanyChangedEvent(value), { room: getSocketCompanyRoom(id) });
        }
        return value;
    }
}
