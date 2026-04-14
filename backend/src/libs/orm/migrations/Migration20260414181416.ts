import { Migration } from '@mikro-orm/migrations';

export class Migration20260414181416 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" alter column "avatar_url" type text using ("avatar_url"::text);`);
    this.addSql(`alter table "user" alter column "avatar_url" drop not null;`);

    this.addSql(`alter table "template" add column "user_id" uuid not null;`);
    this.addSql(`alter table "template" add constraint "template_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "message" add column "role" text not null default 'user';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "template" drop constraint "template_user_id_foreign";`);

    this.addSql(`alter table "message" drop column "role";`);

    this.addSql(`alter table "template" drop column "user_id";`);

    this.addSql(`alter table "user" alter column "avatar_url" type text using ("avatar_url"::text);`);
    this.addSql(`alter table "user" alter column "avatar_url" set not null;`);
  }

}
