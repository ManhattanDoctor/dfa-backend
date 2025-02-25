import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoin1627121260002 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "coin"
            (                
                "id" serial not null
                    constraint "coin_id_pkey" primary key,
                "status" varchar not null,

                "hlf_uid" varchar
                    constraint "coin_hlf_uid_pkey" unique,

                "data" json,
                "balance" json,
                "permissions" json array,

                "created" timestamp default now() not null
            );

            create table if not exists "coin_balance"
            (                
                "id" serial not null
                    constraint "coin_balance_id_pkey" primary key,
    
                "coin_id" integer
                    constraint "coin_balance_coin_id_fkey" references "coin",

                "held" varchar not null,
                "total" varchar not null,
                "in_use" varchar not null,

                "coin_uid" varchar not null,
                "object_uid" varchar not null,

                "created" timestamp default now() not null
            );

            create unique index "coin_balance_ukey_coin_id_object_uid" on "coin_balance" (coin_id, object_uid);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "coin" cascade;
            drop index if exists "coin_hlf_uid_ukey";

            drop table if exists "coin_balance" cascade;
            drop index if exists "coin_balance_ukey_coin_id_object_uid";
        `;
        await queryRunner.query(sql);
    }
}
