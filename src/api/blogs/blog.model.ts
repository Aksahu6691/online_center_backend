import {
  Entity,
  Column,
  ObjectIdColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { Users } from "../user/user.model";

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

  @Column()
  authorId!: string;

  // INFO: This part is not work in mongodbDB database
  @ManyToOne(() => Users, (user) => user.blogs) // Establish ManyToOne relationship
  @JoinColumn({ name: "authorId", referencedColumnName: "id" }) // Join on authorId and user.id
  author!: Users; // This will reference the Users entity

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @BeforeInsert()
  setUploadedDate() {
    this.uploadedDate = new Date();
  }
}
