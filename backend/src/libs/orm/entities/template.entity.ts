import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@/libs/orm/entities/base.entity';
import { User } from '@/libs/orm/entities/user.entity';

@Entity()
export class Template extends BaseEntity {
  @Property({ type: 'text' })
  title: string;

  @Property({ type: 'text' })
  role: string;

  @Property({ type: 'text' })
  content: string;

  @ManyToOne(() => User)
  user: string;
}
