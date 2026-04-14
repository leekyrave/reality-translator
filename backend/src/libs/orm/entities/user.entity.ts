import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  EventArgs,
  Index,
  OneToMany,
  Property,
  wrap,
} from '@mikro-orm/core';
import { BaseEntity } from '@/libs/orm/entities';
import * as argon2 from 'argon2';
import { Workspace } from '@/libs/orm/entities/workspace.entity';
import { Template } from '@/libs/orm/entities/template.entity';

@Entity()
export class User extends BaseEntity {
  @Property({ type: 'text', unique: true })
  @Index()
  email!: string;

  @Property({ type: 'text' })
  password!: string;

  @Property({ type: 'text' })
  name!: string;

  @OneToMany(() => Workspace, (workspace) => workspace.user)
  workspaces = new Collection<Workspace>(this);

  @OneToMany(() => Template, (template) => template.user)
  templates = new Collection<Template>(this);

  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;

  public async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  public verifyPassword(password: string): Promise<boolean> {
    return argon2.verify(this.password, password);
  }

  @BeforeCreate()
  private async hashPasswordBeforeCreate(): Promise<void> {
    this.password = await this.hashPassword(this.password);
  }

  // @BeforeUpdate()
  // private async hashPasswordBeforeUpdate({ changeSet }: EventArgs<User>) {
  //   if (changeSet?.password) {
  //     this.password = await this.hashPassword(this.password);
  //   }
  // }
}
