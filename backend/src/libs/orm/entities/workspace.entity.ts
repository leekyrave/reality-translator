import {
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { User } from '@/libs/orm/entities/user.entity';
import { BaseEntity } from '@/libs/orm/entities';
import { Message } from '@/libs/orm/entities/message.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Workspace extends BaseEntity {
  @Index()
  @Property({ type: 'text' })
  title: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @OneToMany(() => Message, (msg) => msg.workspace)
  messages = new Collection<Message>(this);
}
