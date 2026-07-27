import { IsIn, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class AcControlDto {
  @IsIn(['on', 'off'])
  power!: 'on' | 'off';

  @IsIn(['cool', 'heat', 'fan', 'auto'])
  @IsOptional()
  mode?: 'cool' | 'heat' | 'fan' | 'auto';

  @IsNumber()
  @IsOptional()
  targetTemp?: number;

  @IsIn(['low', 'mid', 'high', 'auto'])
  @IsOptional()
  fanSpeed?: 'low' | 'mid' | 'high' | 'auto';

  @IsBoolean()
  @IsOptional()
  swing?: boolean;
}
