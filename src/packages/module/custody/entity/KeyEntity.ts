
import { TypeormValidableEntity } from '@ts-core/backend';
import { TransformUtil, ObjectUtil } from '@ts-core/common';
import { ClassTransformOptions, Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Key, KeyAlgorithm } from '@project/common/custody';
import * as _ from 'lodash';

@Entity({ name: 'key' })
export class KeyEntity extends TypeormValidableEntity implements Key {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(key: Partial<Key>): KeyEntity {
        let item = new KeyEntity();
        ObjectUtil.copyPartial(key, item);
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
    @IsUUID('4')
    public uid: string;

    @Column()
    @IsString()
    public owner: string;

    @Column({ type: 'varchar' })
    @IsEnum(KeyAlgorithm)
    public algorithm: KeyAlgorithm;

    @CreateDateColumn({ name: 'created' })
    public created: Date;

    @Column()
    @IsString()
    public value: string;

    @Exclude()
    @Column({ name: 'private_key' })
    @IsString()
    public privateKey: string;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Key {
        return TransformUtil.fromClass<Key>(this, options);
    }
}
