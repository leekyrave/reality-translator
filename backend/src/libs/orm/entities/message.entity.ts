import { BaseEntity } from '@/libs/orm/entities/base.entity';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Workspace } from '@/libs/orm/entities/workspace.entity';

@Entity()
export class Message extends BaseEntity {
  @Property({ type: 'text' })
  content: string;

  @Property({ type: 'text', default: 'user' })
  role: string;

  @ManyToOne(() => Workspace)
  workspace: string;
}
