import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1627121250010 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "user"
            (
                "id" serial not null 
                    constraint "user_id_pkey" primary key,
                "uid" varchar not null 
                    constraint "user_uid_ukey" unique,
                "status" varchar not null,
                "address" varchar not null,
                "inviter_uid" varchar not null,
                "wallet" varchar,
                "roles" varchar array,
                "nickname_uid" varchar,
                "created" timestamp default now() not null,
                "updated" timestamp default now() not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "user" cascade;
            drop index if exists "user_uid_ukey";
        `;
        await queryRunner.query(sql);
    }
}
