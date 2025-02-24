import { TransformUtil, Sha512, ObjectUtil } from '@ts-core/common';
import { ClassTransformOptions } from 'class-transformer';
import { IsBoolean, Matches, IsString, IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Action, ActionType } from '@project/common/platform';
import { LedgerBlockTransaction } from '@hlf-explorer/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { UserUtil } from '@hlf-core/common';
import { CoinUtil } from '@hlf-core/coin';
import * as _ from 'lodash';

@Entity({ name: 'action' })
export class ActionEntity extends TypeormValidableEntity implements Action {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    private static getUid(item: ActionEntity, eventUid?: string): string {
        let uid = `${item.requestId}${item.objectUid}${item.type}`;
        if (!_.isNil(eventUid)) {
            uid += eventUid;
        }
        return Sha512.hex(uid);
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
    @IsEnum(ActionType)
    public type: ActionType;

    @Column({ name: 'request_id' })
    @IsString()
    public requestId: string;

    @Column({ name: 'request_user_id' })
    @Matches(UserUtil.UID_REG_EXP)
    public requestUserId: string;

    @Column({ name: 'object_uid' })
    @IsString()
    public objectUid: string;

    @Column({ name: 'is_executed' })
    @IsBoolean()
    public isExecuted: boolean;

    @Column({ name: 'initiator_uid' })
    @IsOptional()
    @IsString()
    public initiatorUid?: string;

    @Column({ name: 'otc_uid' })
    @IsOptional()
    // @Matches(UserUtil.UID_REG_EXP)
    public otcUid?: string;
    
    @Column({ name: 'user_uid' })
    @IsOptional()
    @Matches(UserUtil.UID_REG_EXP)
    public userUid?: string;

    @Column({ name: 'coin_uid' })
    @IsOptional()
    @Matches(CoinUtil.UID_REG_EXP)
    public coinUid?: string;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    public amount?: string;

    @Column()
    @IsDate()
    public date: Date;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(type?: ActionType, objectUid?: string, details?: Partial<ActionEntity>, transaction?: LedgerBlockTransaction, eventUid?: string) {
        super();
        if (!_.isNil(type)) {
            this.type = type;
        }
        if (!_.isNil(objectUid)) {
            this.objectUid = objectUid;
        }
        if (!_.isNil(details)) {
            ObjectUtil.copyPartial(details, this);
        }
        if (_.isNil(transaction)) {
            return;
        }

        this.requestId = transaction.requestId;
        this.requestUserId = transaction.requestUserId;

        this.date = transaction.date;
        this.isExecuted = transaction.validationCode === 0 && _.isNil(transaction.responseErrorCode);

        this.uid = ActionEntity.getUid(this, eventUid);
        if (ObjectUtil.hasOwnProperty(transaction.request?.request, 'initiatorUid')) {
            this.initiatorUid = transaction.request.request.initiatorUid;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Action {
        return TransformUtil.fromClass<Action>(this, options);
    }
}
