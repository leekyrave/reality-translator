import { Migration } from '@mikro-orm/migrations';

export class Migration20260415003543 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "template" add column "is_default" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "template" drop column "is_default";`);
  }

}
