import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { IOpenIdAttributes } from '../lib';
import { IsOptional, IsString } from 'class-validator';
import { IOpenIdUser } from '@ts-core/openid-common';

export class OpenIdUpdateCommand extends TransportCommandAsync<IOpenIdUpdateDto, IOpenIdUser> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'OPEN_ID__UPDATE_COMMAND';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IOpenIdUpdateDto) {
        super(OpenIdUpdateCommand.NAME, TransformUtil.toClass(OpenIdUpdateDto, request));
    }
}

export interface IOpenIdUpdateDto {
    login: string;
    attributes?: IOpenIdAttributes;
}

export class OpenIdUpdateDto implements IOpenIdUpdateDto {
    @IsString()
    public login: string;

    @IsOptional()
    public attributes?: IOpenIdAttributes;
}