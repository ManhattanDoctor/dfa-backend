import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAction1627121250050 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "action"
            (                
                "id" serial not null
                    constraint "action_id_pkey" primary key,
                "uid" varchar not null
                    constraint "action_uid_ukey" unique,
                "date" timestamp not null,
                "type" varchar not null,
                "request_id" varchar not null,
                "object_uid" varchar not null,
                "is_executed" boolean not null,

                "initiator_uid" varchar,

                "user_uid" varchar,
                "coin_uid" varchar,
                "auction_uid" varchar,
                "nickname_uid" varchar,

                "amount" varchar
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "action" cascade;
            drop index if exists "action_uid_ukey";
        `;
        await queryRunner.query(sql);
    }
}
