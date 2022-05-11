import { Category } from './category.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'foods' })
export class Food {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({ length: 2000, nullable: true })
    imgLink: string;

    @Column({ length: 100, nullable: false })
    price: string;

    @Column({ length: 255, nullable: false })
    descriptions: string;

    @Column({ nullable: true })
    idCategory: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;

    @ManyToOne(() => Category)
    @JoinColumn({
        name: 'idCategory',
    })
    category: Category;
}
