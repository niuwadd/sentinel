import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryHistoryDto {
  @IsIn(['1h', '6h', '24h', '7d', '30d'])
  @IsOptional()
  range?: string = '24h';

  @IsNumber()
  @IsOptional()
  interval?: number;
}
