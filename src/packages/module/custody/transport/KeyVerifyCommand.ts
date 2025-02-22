import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { IsString } from 'class-validator';

export class KeyVerifyCommand extends TransportCommandAsync<IKeyVerifyDto, boolean> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'KeyVerifyCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IKeyVerifyDto) {
        super(KeyVerifyCommand.NAME, TransformUtil.toClass(KeyVerifyDto, request));
    }
}

export interface IKeyVerifyDto {
    uid: string;
    message: string;
    signature: string;
}

export class KeyVerifyDto implements IKeyVerifyDto {
    @IsString()
    public uid: string;

    @IsString()
    public message: string;

    @IsString()
    public signature: string;;
}