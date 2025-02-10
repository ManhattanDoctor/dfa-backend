import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKey1627121260000 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "key"
            (
                "id" serial not null 
                    constraint "key_id_pkey" primary key,
                "uid" varchar,
                "owner" varchar,
                "algorithm" varchar,
                "public_key" varchar,
                "private_key" varchar,

                "created" timestamp default now() not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "key" cascade;
        `;
        await queryRunner.query(sql);
    }
}
