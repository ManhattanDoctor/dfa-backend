import { TransformUtil, ObjectUtil } from '@ts-core/common';
import { Type, ClassTransformOptions, Exclude, Expose, Transform } from 'class-transformer';
import { Matches, IsNumber, IsOptional, IsNumberString, IsEnum, ValidateNested, MaxLength, Length, IsJSON } from 'class-validator';
import { CreateDateColumn, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { TypeormJSONTransformer, TypeormValidableEntity } from '@ts-core/backend';
import { CoinSeries, CoinType, Coin as HlfCoin, CoinUtil as HlfCoinUtil, ICoinSeries } from '@project/common/hlf/coin';
import { Coin, COIN_NAME_MAX_LENGTH, COIN_NAME_MIN_LENGTH, COIN_PICTURE_MAX_LENGTH, CoinStatus } from '@project/common/platform/coin';
import { CoinBalanceEntity } from './CoinBalanceEntity';
import { CoinUtil, ICoinBalance } from '@hlf-core/coin';
import { ICoinData } from '@project/common/hlf/coin/data';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { ICoinPermission } from '@project/common/hlf/coin/permission';
import { CompanyEntity } from '../company';
import * as _ from 'lodash';

@Entity({ name: 'coin' })
export class CoinEntity extends TypeormValidableEntity implements Coin {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(company: Partial<CoinEntity>): CoinEntity {
        let item = new CoinEntity();
        ObjectUtil.copyPartial(company, item);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @Length(COIN_NAME_MIN_LENGTH, COIN_NAME_MAX_LENGTH)
    public name: string;

    @Column({ type: 'varchar' })
    @IsEnum(CoinStatus)
    public status: CoinStatus;

    @Column()
    @IsOptional()
    @MaxLength(COIN_PICTURE_MAX_LENGTH)
    public picture: string;

    @Column({ name: 'company_id' })
    @IsOptional()
    @IsNumber()
    public companyId: number;

    @Column({ type: 'varchar' })
    @IsEnum(CoinType)
    public type: CoinType;

    @Column({ type: 'varchar' })
    @Matches(HlfCoinUtil.TICKER_REG_EXP)
    public ticker: string;

    @Column({ name: 'hlf_uid' })
    @IsOptional()
    @Matches(CoinUtil.UID_REG_EXP)
    public hlfUid?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @IsOptional()
    @IsJSON()
    @ValidateNested()
    public data?: ICoinData;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @IsOptional()
    @Type(() => CoinSeries)
    @ValidateNested()
    public series?: ICoinSeries;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @IsOptional()
    @ValidateNested()
    public balance?: ICoinBalance;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @IsOptional()
    @ValidateNested()
    public permissions?: Array<ICoinPermission>;

    @CreateDateColumn()
    public created: Date;

    @Exclude()
    @ManyToOne(() => CompanyEntity, company => company.users, { cascade: true })
    @IsOptional()
    @ValidateNested()
    @JoinColumn({ name: 'company_id' })
    public company?: CompanyEntity;

    @Exclude()
    @OneToMany(() => CoinBalanceEntity, item => item.coin)
    @Type(() => CoinBalanceEntity)
    public balances?: Array<CoinBalanceEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Coin {
        return TransformUtil.fromClass<Coin>(this, options);
    }
}