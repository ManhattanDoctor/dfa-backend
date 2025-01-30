import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNickname1627121250040 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "nickname"
            (
                "id" serial not null 
                    constraint "nickname_id_pkey" primary key,
                "uid" varchar not null
                    constraint "nickname_uid_ukey" unique,
                "nickname" varchar not null,
                "owner_uid" varchar not null,
                "parent_uid" varchar,
                "created" timestamp default now() not null,
                "updated" timestamp default now() not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "nickname" cascade;
            drop index if exists "nickname_uid_ukey";
        `;
        await queryRunner.query(sql);
    }
}
