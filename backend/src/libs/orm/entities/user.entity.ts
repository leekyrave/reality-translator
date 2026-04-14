import {
  BeforeCreate,
  BeforeUpdate,
  Entity,
  EventArgs,
  Index,
  Property,
  wrap,
} from '@mikro-orm/core';
import { BaseEntity } from '@/libs/orm/entities';
import * as argon2 from 'argon2';

@Entity()
export class User extends BaseEntity {
  @Property({ type: 'text', unique: true })
  @Index()
  email!: string;

  @Property({ type: 'text' })
  password!: string;

  @Property({ type: 'text' })
  name!: string;

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
