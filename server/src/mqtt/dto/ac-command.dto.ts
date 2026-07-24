import { IsString, IsOptional, IsNumber, IsBoolean, IsIn } from 'class-validator';

export class AcCommandDto {
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

export class AcControlDto {
  @IsString()
  deviceId!: string;

  @IsIn(['command'])
  type!: 'command';

  @IsIn(['ac_control'])
  action!: 'ac_control';

  @IsOptional()
  payload?: AcCommandDto;
}
