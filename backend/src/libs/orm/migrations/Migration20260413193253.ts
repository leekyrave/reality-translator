import { Migration } from '@mikro-orm/migrations';

export class Migration20260413193253 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz null, "email" text not null, "password" text not null, "name" text not null, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`create index "user_email_index" on "user" ("email");`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }

}
