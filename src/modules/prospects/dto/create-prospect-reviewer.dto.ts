import { IsNumber, IsString } from 'class-validator';

export class CreateProspectReviewerDto {
  constructor(data?: Partial<CreateProspectReviewerDto>) {
    Object.assign(this, data);
  }

  @IsString()
  name: string;

  @IsString()
  image: string;

  @IsNumber()
  rating: number;

  @IsString()
  google_review_id: string;
}
