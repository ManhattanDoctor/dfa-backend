import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { IsString } from 'class-validator';

export class KeySignCommand extends TransportCommandAsync<IKeySignDto, string> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'KEY_SIGN';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IKeySignDto) {
        super(KeySignCommand.NAME, TransformUtil.toClass(KeySignDto, request));
    }
}

export interface IKeySignDto {
    uid: string;
    message: string;
}

export class KeySignDto implements IKeySignDto {
    @IsString()
    public uid: string;

    @IsString()
    public message: string;
}