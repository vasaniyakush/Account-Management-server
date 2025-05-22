import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('viewers')
@Unique(['viewer', 'viewee']) // Prevent duplicate entries
export class Viewer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'viewerId' })
  viewer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'vieweeId' })
  viewee: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
