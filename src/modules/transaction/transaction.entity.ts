import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { TransactionStatus, TransactionType } from './dto/transaction.enum';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  amount: string;

  @Column({ default: false })
  visible: boolean;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => Account, {
    eager: true,
    onDelete: 'CASCADE',
  })
  account1: Account;

  @ManyToOne(() => Account, {
    nullable: true,
    eager: true,
    onDelete: 'NO ACTION',
  })
  account2: Account | null;
}
