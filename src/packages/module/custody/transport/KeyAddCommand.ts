import { ITraceable, TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { IsEnum, IsString } from 'class-validator';

export class KeyAddCommand extends TransportCommandAsync<IKeyAddDto, Key> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'KeyAddCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IKeyAddDto) {
        super(KeyAddCommand.NAME, TransformUtil.toClass(KeyAddDto, request));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(value: Key): Key {
        return TransformUtil.toClass(Key, value);
    }
}

export interface IKeyAddDto extends ITraceable {
    owner: string;
    algorithm: KeyAlgorithm;
}

class KeyAddDto implements IKeyAddDto {
    @IsString()
    public owner: string;

    @IsEnum(KeyAlgorithm)
    public algorithm: KeyAlgorithm;
}