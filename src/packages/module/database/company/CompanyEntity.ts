
import { Company, CompanyStatus, CompanyTaxDetails } from '@project/common/platform/company';
import { ObjectUtil, TraceUtil, TransformUtil } from '@ts-core/common';
import { TypeormJSONTransformer, TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type, ClassTransformOptions, Expose } from 'class-transformer';
import { ValidateNested, Matches, IsEnum, IsJSON, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, OneToMany, CreateDateColumn, Entity, Index, OneToOne, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../user';
import { CompanyPreferencesEntity } from './CompanyPreferencesEntity';
import { UserUtil } from '@hlf-core/common';
import { HashUtil, TRANSFORM_SINGLE } from '@project/module/core';
import { IHlfKeyOwner } from '@project/module/hlf/service';
import * as _ from 'lodash';

@Entity({ name: 'company' })
export class CompanyEntity extends TypeormValidableEntity implements Company, IHlfKeyOwner {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(company: Partial<CompanyEntity>): CompanyEntity {
        if (_.isNil(company.uid)) {
            company.uid = HashUtil.md5(TraceUtil.generate());
        }
        let item = new CompanyEntity();
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
    @IsString()
    public uid: string;

    @Column({ type: 'varchar' })
    @IsEnum(CompanyStatus)
    public status: CompanyStatus;

    @Column({ name: 'hlf_uid' })
    @IsOptional()
    @Matches(UserUtil.UID_REG_EXP)
    public hlfUid?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @Type(() => CompanyTaxDetails)
    @ValidateNested()
    public details: CompanyTaxDetails;

    @OneToOne(() => CompanyPreferencesEntity, preferences => preferences.company, { cascade: true })
    @ValidateNested()
    public preferences: CompanyPreferencesEntity;

    @CreateDateColumn()
    public created: Date;

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
