import { randomUUID } from "crypto"
// this is the entity Prisma will create soon
export class User {
  readonly id: string
  name: string
  email: string
  password: string
  bio: string
  contact: string
  module: string

  constructor(){
    this.id = randomUUID()
  }
}