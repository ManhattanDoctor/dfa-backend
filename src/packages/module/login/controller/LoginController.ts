import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { TraceUtil } from '@ts-core/common';
import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';
import { LOGIN_URL } from '@project/common/platform/api';
import { LoginService } from '../service';
import { ILoginDto, ILoginDtoResponse, LoginData } from '@project/common/platform/api/login';
import { LoginResource } from '@project/common/platform/api/login';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LoginDto implements ILoginDto {
    @ApiProperty()
    @IsDefined()
    public data: LoginData;

    @ApiProperty()
    @IsEnum(LoginResource)
    public resource: LoginResource;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(LOGIN_URL)
export class LoginController extends DefaultController<ILoginDto, ILoginDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: LoginService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Post()
    public async execute(@Body() params: LoginDto): Promise<ILoginDtoResponse> {
        return this.service.login(TraceUtil.addIfNeed(params));
    }
}
