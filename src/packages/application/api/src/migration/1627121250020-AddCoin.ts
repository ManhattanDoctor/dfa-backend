import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoin1627121250020 implements MigrationInterface {
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
                "uid" varchar not null 
                    constraint "coin_uid_ukey" unique,
                "balance" json not null,

                "created" timestamp default now() not null,
                "updated" timestamp default now() not null
            );

            create table if not exists "coin_balance"
            (                
                "id" serial not null
                    constraint "coin_balance_id_pkey" primary key,
    
                "coin_id" integer
                    constraint "coin_balance_coin_id_fkey" references "coin",

                "coin_uid" varchar not null,

                "uid" varchar not null,
                "held" varchar not null,
                "total" varchar not null,
                "in_use" varchar not null,

                "created" timestamp default now() not null,
                "updated" timestamp default now() not null
            );

            create unique index "coin_balance_ukey_coin_id_uid" on "coin_balance" (coin_id, uid);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "coin" cascade;
            drop index if exists "coin_uid_ukey";

            drop table if exists "coin_balance" cascade;
            drop index if exists "coin_balance_ukey_coin_id_uid";
        `;
        await queryRunner.query(sql);
    }
}
