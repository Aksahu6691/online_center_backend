import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ObjectIdColumn,
  OneToMany,
} from "typeorm";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { Blog } from "../blogs/blog.model";

@Entity("users")
export class Users {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ unique: true })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 15, unique: true })
  mobile!: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  email?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  photo?: string | null;

  @Column({ type: "varchar", length: 50 })
  role!: string; // e.g., 'admin', 'user'

  @Column({ type: "varchar", length: 255 })
  designation!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "boolean", default: true })
  status!: boolean;

  @Column({ type: "timestamp", nullable: true })
  passwordUpdatedAt?: Date | null;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs!: Blog[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
      this.passwordUpdatedAt = new Date();
    }
  }

  // Method to compare password with hashed password in DB
  async comparePassword(pswd: string): Promise<boolean> {
    return bcrypt.compare(pswd, this.password);
  }
}
