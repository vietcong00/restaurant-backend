import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Category } from 'src/modules/category/entity/category.entity';

@Entity({ name: 'foods' })
export class Food extends BaseEntity {
    @Column({ length: 2000, nullable: true })
    foodName: string;

    @Column({ nullable: true })
    foodImgId: number;

    @Column({ nullable: true })
    price: number;

    @Column({ nullable: true })
    categoryId: number;

    @ManyToOne(() => Category)
    @JoinColumn({
        name: 'categoryId',
    })
    category: Category;
}
