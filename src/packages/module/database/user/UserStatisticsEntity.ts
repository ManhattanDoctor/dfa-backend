import { UserStatistics } from '@project/common/platform/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity({ name: 'user_statistics' })
export class UserStatisticsEntity extends TypeormValidableEntity implements UserStatistics {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(): UserStatisticsEntity {
        let item = new UserStatisticsEntity();
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

    @Exclude()
    @OneToOne(() => UserEntity, user => user.statistics, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    public user: UserEntity;
}
