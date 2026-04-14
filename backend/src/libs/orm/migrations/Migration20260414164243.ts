import { Migration } from '@mikro-orm/migrations';

export class Migration20260414164243 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "template" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz null, "title" text not null, "role" text not null, "content" text not null, constraint "template_pkey" primary key ("id"));`);

    this.addSql(`alter table "user" add column "avatar_url" text not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "template" cascade;`);

    this.addSql(`alter table "user" drop column "avatar_url";`);
  }

}
