import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async generateAndHashPassword(
    password?: string,
  ): Promise<{ hash: string; text: string }> {
    const genPassword = password ?? (await this.generatePassword());
    const hashPassword = await this.hashPassword(genPassword); // You can adjust the salt rounds

    return { hash: hashPassword, text: genPassword };
  }

  protected async generatePassword(length: number = 8) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      str += chars.charAt(randomIndex);
    }

    return str;
  }
}