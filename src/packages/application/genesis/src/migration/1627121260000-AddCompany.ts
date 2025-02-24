import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompany1627121260000 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "company"
            (
                "id" serial not null 
                    constraint "company_id_pkey" primary key,
                "uid" varchar not null 
                    constraint "company_uid_pkey" unique,
                "hlf_uid" varchar 
                    constraint "company_hlf_uid_pkey" unique,
                "status" varchar not null,
                "details" json not null,
                "created" timestamp default now() not null
            );

            create table if not exists "company_preferences"
            (
                "id" serial not null 
                    constraint "company_preferences_id_pkey" primary key,
                "company_id" integer
                    constraint "company_preferences_company_id_key" unique
                    constraint "company_preferences_company_id_fkey" references "company" on delete cascade,
                "name" varchar not null,
                "phone" varchar,
                "email" varchar,
                "picture" varchar,
                "website" varchar,
                "address" varchar,
                "description" varchar
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "company" cascade;
            drop table if exists "company_preferences" cascade;
        `;
        await queryRunner.query(sql);
    }
}
