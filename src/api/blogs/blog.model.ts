import { Entity, Column, ObjectIdColumn, BeforeInsert } from "typeorm";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

@Entity("blogs")
export class Blog {
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

  @Column({ type: "varchar", length: 255 }) // Removed `unique: true`
  author!: string; // Should store a User ID

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @BeforeInsert()
  setUploadedDate() {
    this.uploadedDate = new Date();
  }
}
