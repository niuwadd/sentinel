import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsString()
  CLOUD_MQTT_URL?: string;

  @IsOptional()
  @IsString()
  CLOUD_MQTT_USERNAME?: string;

  @IsOptional()
  @IsString()
  CLOUD_MQTT_PASSWORD?: string;

  @IsOptional()
  @IsString()
  LOCAL_MQTT_URL?: string;

  @IsOptional()
  @IsString()
  LOCAL_MQTT_WS_URL?: string;

  @IsOptional()
  @IsString()
  LOCAL_MQTT_USERNAME?: string;

  @IsOptional()
  @IsString()
  LOCAL_MQTT_PASSWORD?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  DATABASE_URL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  INFLUXDB_URL?: string;

  @IsOptional()
  @IsString()
  INFLUXDB_TOKEN?: string;

  @IsOptional()
  @IsString()
  INFLUXDB_ORG?: string;

  @IsOptional()
  @IsString()
  INFLUXDB_BUCKET?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsString()
  REDIS_PORT?: string;

  @IsNotEmpty()
  @IsString()
  OPENAI_API_KEY!: string;

  @IsOptional()
  @IsString()
  LLM_PROVIDER?: string;

  @IsOptional()
  @IsString()
  LLM_MODEL?: string;

  @IsOptional()
  @IsString()
  LLM_TEMPERATURE?: string;

  @IsOptional()
  @IsString()
  LLM_MAX_TOKENS?: string;

  @IsOptional()
  @IsString()
  LLM_TIMEOUT?: string;

  @IsOptional()
  @IsString()
  AGENT_EVALUATE_INTERVAL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig);

  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

  if (errors.length > 0) {
    for (const error of errors) {
      const constraints = error.constraints;
      if (constraints) {
        for (const key of Object.keys(constraints)) {
          if (key === 'isNotEmpty' && error.property === 'OPENAI_API_KEY' && !hasOpenAiKey) {
            console.warn(
              '⚠ OPENAI_API_KEY not set — AI Agent will run in fallback (threshold) mode',
            );
            return config;
          }
        }
      }
    }
  }

  return config;
}
