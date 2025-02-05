import { Entity, Column, ObjectIdColumn, BeforeInsert } from "typeorm";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

@Entity("testimonials")
export class Testimonials {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ unique: true })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  designation!: string;

  @Column({ type: "text" })
  message!: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
