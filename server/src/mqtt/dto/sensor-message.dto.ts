import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';

export class SensorMessageDto {
  @IsString()
  deviceId!: string;

  @IsIn(['sensor'])
  type!: 'sensor';

  @IsNumber()
  temp!: number;

  @IsNumber()
  humi!: number;

  @IsNumber()
  @IsOptional()
  heatIndex?: number;

  @IsNumber()
  @IsOptional()
  battery?: number;

  @IsNumber()
  @IsOptional()
  rssi?: number;

  @IsIn(['local', 'cloud'])
  @IsOptional()
  broker?: 'local' | 'cloud';

  @IsIn(['online', 'offline', 'fault'])
  @IsOptional()
  status?: 'online' | 'offline' | 'fault';

  @IsString()
  @IsOptional()
  timestamp?: string;
}
