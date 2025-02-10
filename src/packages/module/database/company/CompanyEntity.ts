
import { Company, CompanyStatus, CompanyTaxDetails } from '@project/common/platform/company';
import { ObjectUtil, TransformUtil } from '@ts-core/common';
import { TypeormJSONTransformer, TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type, ClassTransformOptions, Expose } from 'class-transformer';
import { ValidateNested, Matches, IsEnum, IsJSON, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, OneToMany, CreateDateColumn, Entity, Index, OneToOne, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../user';
import { CompanyPreferencesEntity } from './CompanyPreferencesEntity';
import { UserUtil } from '@hlf-core/common';
import * as _ from 'lodash';
import { TRANSFORM_PRIVATE } from '@project/module/core';

@Entity({ name: 'company' })
export class CompanyEntity extends TypeormValidableEntity implements Company {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(user: Partial<Company>): CompanyEntity {
        let item = new CompanyEntity();
        ObjectUtil.copyPartial(user, item);
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
    @IsEnum(CompanyStatus)
    public status: CompanyStatus;

    @Column({ name: 'hlf_uid' })
    @IsOptional()
    @Matches(UserUtil.UID_REG_EXP)
    public hlfUid?: string;

    @CreateDateColumn()
    public created: Date;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @Type(() => CompanyTaxDetails)
    @ValidateNested()
    public details: CompanyTaxDetails;

    @OneToOne(() => CompanyPreferencesEntity, preferences => preferences.company, { cascade: true })
    @ValidateNested()
    public preferences: CompanyPreferencesEntity;

    @Exclude()
    @OneToMany(() => UserEntity, item => item.company)
    @Type(() => UserEntity)
    public users: Array<UserEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Company {
        return TransformUtil.fromClass<Company>(this, options);
    }
}
