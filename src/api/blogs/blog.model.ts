import { Entity, Column, ObjectIdColumn, BeforeInsert } from "typeorm";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

@Entity("blogs")
export class Blogs {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ unique: true })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  image!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "timestamp" })
  uploadedDate!: Date;

  @Column({ type: "varchar", length: 255, unique: true })
  author!: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
