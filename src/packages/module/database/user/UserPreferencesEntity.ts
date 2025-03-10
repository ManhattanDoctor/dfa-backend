import {
    UserPreferences,
    UserPreferencesTheme,
    USER_PREFERENCES_NAME_MIN_LENGTH,
    USER_PREFERENCES_NAME_MAX_LENGTH,
    USER_PREFERENCES_PHONE_MAX_LENGTH,
    USER_PREFERENCES_EMAIL_MAX_LENGTH,
    USER_PREFERENCES_PICTURE_MAX_LENGTH,
} from '@project/common/platform/user';
import { ObjectUtil, TraceUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, Length, IsEnum, MaxLength, IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { UserPreferencesLanguage } from '@project/common/platform/user';
import { TRANSFORM_PRIVATE } from '@project/module/core';
import { ImageUtil } from '@project/common/platform/util';
import * as _ from 'lodash';

@Entity({ name: 'user_preferences' })
export class UserPreferencesEntity extends TypeormValidableEntity implements UserPreferences {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(preferences: Partial<UserPreferences>): UserPreferencesEntity {
        if (_.isNil(preferences.picture)) {
            preferences.picture = ImageUtil.getUser(TraceUtil.generate());
        }

        let item = new UserPreferencesEntity();
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
    @Length(USER_PREFERENCES_NAME_MIN_LENGTH, USER_PREFERENCES_NAME_MAX_LENGTH)
    public name: string;
    
    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsEmail()
    @MaxLength(USER_PREFERENCES_EMAIL_MAX_LENGTH)
    public email: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsOptional()
    @IsEnum(UserPreferencesTheme)
    public theme?: UserPreferencesTheme;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_PHONE_MAX_LENGTH)
    public phone?: string;

    @Column()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_PICTURE_MAX_LENGTH)
    public picture?: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsOptional()
    @IsEnum(UserPreferencesLanguage)
    public language?: UserPreferencesLanguage;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.preferences)
    @JoinColumn({ name: 'user_id' })
    public user: UserEntity;
}
