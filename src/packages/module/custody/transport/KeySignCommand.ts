import { ISignature, TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';

export class KeySignCommand extends TransportCommandAsync<IKeySignDto, ISignature> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'KeySignCommand';

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
    nonce?: string;
}

export class KeySignDto implements IKeySignDto {
    @IsString()
    public uid: string;

    @IsString()
    public message: string;

    @IsOptional()
    @IsString()
    public nonce?: string;
}