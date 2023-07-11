import { Injectable } from "@nestjs/common";
import { hashSync } from "bcryptjs";

@Injectable()
export class HashingService {
  hashPassword(password: string, salt: number): string {
    return hashSync(password, salt)
  }
}