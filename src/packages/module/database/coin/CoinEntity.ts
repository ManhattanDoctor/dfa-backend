import { TransformUtil, ObjectUtil } from '@ts-core/common';
import { Type, ClassTransformOptions, Exclude, Expose, Transform } from 'class-transformer';
import { Matches, IsNumber, IsOptional, IsNumberString, IsEnum, ValidateNested } from 'class-validator';
import { CreateDateColumn, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TypeormJSONTransformer, TypeormValidableEntity } from '@ts-core/backend';
import { CoinFactory, Coin as HlfCoin } from '@project/common/hlf/coin';
import { Coin, CoinStatus } from '@project/common/platform/coin';
import { CoinBalanceEntity } from './CoinBalanceEntity';
import { CoinUtil, ICoinBalance } from '@hlf-core/coin';
import { ICoinData } from '@project/common/hlf/coin/data';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { ICoinPermission } from '@project/common/hlf/coin/permission';
import * as _ from 'lodash';
import { CompanyEntity } from '../company';

@Entity({ name: 'coin' })
export class CoinEntity extends TypeormValidableEntity implements Coin {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static updateEntity(item: Partial<CoinEntity>, coin: HlfCoin): Partial<CoinEntity> {
        ObjectUtil.copyProperties(coin, item);
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

    @Column({ type: 'varchar' })
    @IsEnum(CoinStatus)
    public status: CoinStatus;

    @Column({ name: 'company_id' })
    @IsOptional()
    @IsNumber()
    public companyId: number;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @IsOptional()
    @ValidateNested()
    public data?: ICoinData;

    @Column({ name: 'hlf_uid' })
    @Matches(CoinUtil.UID_REG_EXP)
    public hlfUid?: string;

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