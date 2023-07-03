import { Exclude } from "class-transformer"
import { randomUUID } from "crypto"

export class User {
  readonly id: string
  name: string
  email: string

  @Exclude()
  password: string

  bio: string
  contact: string
  module: string

  constructor(){
    this.id = randomUUID()
  }
}