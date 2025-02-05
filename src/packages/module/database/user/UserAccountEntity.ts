import { UserAccount, UserAccountType } from '@project/common/platform/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import * as _ from 'lodash';

@Entity({ name: 'user_account' })
export class UserAccountEntity extends TypeormValidableEntity implements UserAccount {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(type: UserAccountType): UserAccountEntity {
        let item = new UserAccountEntity();
        item.type = type;
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

    @Column({ type: 'varchar' })
    @IsEnum(UserAccountType)
    public type: UserAccountType;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.account)
    @JoinColumn({ name: 'user_id' })
    public user: UserEntity;
}
