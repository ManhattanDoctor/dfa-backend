
import { User, UserStatus } from '@project/common/platform/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { TransformUtil, ObjectUtil, IUIDable, TraceUtil } from '@ts-core/common';
import { Expose, ClassTransformOptions, Exclude } from 'class-transformer';
import { ValidateNested, IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserPreferencesEntity } from './UserPreferencesEntity';
import { HashUtil, TRANSFORM_PRIVATE } from '@project/module/core';
import { CompanyEntity } from '../company';
import { IOpenIdUser } from '@ts-core/openid-common';
import * as _ from 'lodash';

@Entity({ name: 'user' })
export class UserEntity extends TypeormValidableEntity implements User, IOpenIdUser {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(user: Partial<UserEntity>): UserEntity {
        if (_.isNil(user.uid)) {
            user.uid = HashUtil.md5(TraceUtil.generate());
        }
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

    @Column()
    @IsString()
    public uid: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsString()
    public login: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsEnum(UserStatus)
    public status: UserStatus;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, { cascade: true })
    @ValidateNested()
    public preferences: UserPreferencesEntity;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @CreateDateColumn()
    public created: Date;

    @Exclude()
    @Column({ name: 'company_id' })
    @IsOptional()
    @IsNumber()
    public companyId?: number;

    @Exclude()
    @ManyToOne(() => CompanyEntity, company => company.users, { cascade: true })
    @IsOptional()
    @ValidateNested()
    @JoinColumn({ name: 'company_id' })
    public company?: CompanyEntity;

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
