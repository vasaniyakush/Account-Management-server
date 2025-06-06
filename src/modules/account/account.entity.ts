import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccountType } from './dto/account.enums';
import { User } from '../user/user.entity';
@Entity()
export class Account {
  // add auto increment to id
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  balance: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.BANK,
  })
  accountType: AccountType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'userId' })
  user: string;
}
