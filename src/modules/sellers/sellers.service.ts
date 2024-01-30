import { Injectable } from '@nestjs/common';

@Injectable()
export class SellersService {
  createOrder(createSellerDto: any) {
    return 'This action adds a new seller';
  }

  findAll() {
    return `This action returns all sellers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seller`;
  }

  remove(id: number) {
    return `This action removes a #${id} seller`;
  }
}
