import { Migration } from '@mikro-orm/migrations';

export class Migration20260414163527 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "workspace" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz null, "title" text not null, "user_id" uuid not null, constraint "workspace_pkey" primary key ("id"));`);
    this.addSql(`create index "workspace_title_index" on "workspace" ("title");`);

    this.addSql(`create table "message" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz null, "content" text not null, "workspace_id" uuid not null, constraint "message_pkey" primary key ("id"));`);

    this.addSql(`alter table "workspace" add constraint "workspace_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "message" add constraint "message_workspace_id_foreign" foreign key ("workspace_id") references "workspace" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "message" drop constraint "message_workspace_id_foreign";`);

    this.addSql(`drop table if exists "workspace" cascade;`);

    this.addSql(`drop table if exists "message" cascade;`);
  }

}
