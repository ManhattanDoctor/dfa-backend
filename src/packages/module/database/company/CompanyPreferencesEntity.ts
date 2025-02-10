import { COMPANY_PREFERENCES_ADDRESS_MAX_LENGTH, COMPANY_PREFERENCES_DESCRIPTION_MAX_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH, COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_PICTURE_MAX_LENGTH, COMPANY_PREFERENCES_WEBSITE_MAX_LENGTH } from '@project/common/platform/company';
import { ObjectUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude } from 'class-transformer';
import { IsEmail, Length, MaxLength, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyPreferences } from '@project/common/platform/company';
import { CompanyEntity } from './CompanyEntity';
import * as _ from 'lodash';

@Entity({ name: 'company_preferences' })
export class CompanyPreferencesEntity extends TypeormValidableEntity implements CompanyPreferences {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(preferences: Partial<CompanyPreferences>): CompanyPreferencesEntity {
        let item = new CompanyPreferencesEntity();
        ObjectUtil.copyPartial(preferences, item);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @Length(COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH)
    public name: string;

    @Column()
    @IsOptional()
    @IsPhoneNumber()
    public phone?: string;

    @Column()
    @IsOptional()
    @IsEmail()
    public email?: string;

    @Column()
    @IsOptional()
    @MaxLength(COMPANY_PREFERENCES_PICTURE_MAX_LENGTH)
    public picture?: string;

    @Column()
    @IsOptional()
    @MaxLength(COMPANY_PREFERENCES_WEBSITE_MAX_LENGTH)
    public website?: string;

    @Column()
    @IsOptional()
    @MaxLength(COMPANY_PREFERENCES_ADDRESS_MAX_LENGTH)
    public address?: string;

    @IsOptional()
    @MaxLength(COMPANY_PREFERENCES_DESCRIPTION_MAX_LENGTH)
    public description?: string;

    @Exclude()
    @OneToOne(() => CompanyEntity, company => company.preferences)
    @JoinColumn({ name: 'company_id' })
    public company: CompanyEntity;
}
