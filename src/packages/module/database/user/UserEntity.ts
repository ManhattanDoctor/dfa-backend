
import { User, UserStatus } from '@project/common/platform/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { TransformUtil, ObjectUtil } from '@ts-core/common';
import { IOpenIdUser } from '@ts-core/openid-common';
import { Expose, ClassTransformOptions } from 'class-transformer';
import { ValidateNested, IsEnum, IsNumber, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryColumn, OneToOne } from 'typeorm';
import { UserAccountEntity } from './UserAccountEntity';
import { UserPreferencesEntity } from './UserPreferencesEntity';
import { UserStatisticsEntity } from './UserStatisticsEntity';
import { TransformGroup } from '@project/module/core';
import * as _ from 'lodash';

@Entity({ name: 'user' })
export class UserEntity extends TypeormValidableEntity implements User, IOpenIdUser {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(user: Partial<User>): UserEntity {
        let item = new UserEntity();
        ObjectUtil.copyPartial(user, item);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryColumn()
    @IsString()
    public id: string;

    @Expose({ groups: [TransformGroup.PRIVATE] })
    @Column()
    @IsString()
    public login: string;

    @Expose({ groups: [TransformGroup.PRIVATE] })
    @Column({ type: 'varchar' })
    @IsEnum(UserStatus)
    public status: UserStatus;

    @Expose({ groups: [TransformGroup.PRIVATE] })
    @CreateDateColumn({ name: 'created' })
    public created: Date;

    @OneToOne(() => UserAccountEntity, account => account.user, { cascade: true })
    @ValidateNested()
    public account: UserAccountEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, { cascade: true })
    @ValidateNested()
    public preferences: UserPreferencesEntity;

    @OneToOne(() => UserStatisticsEntity, statistics => statistics.user, { cascade: true })
    @ValidateNested()
    public statistics: UserStatisticsEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): User {
        return TransformUtil.fromClass<User>(this, options);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get sub(): string {
        return this.id;
    }

}
