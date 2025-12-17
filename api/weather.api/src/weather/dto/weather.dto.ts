import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateWeatherDto {
  // Identificação temporal
  @IsString()
  @IsNotEmpty()
  collectedAt: string;

  @IsString()
  @IsNotEmpty()
  forecastTime: string;

  @IsNumber()
  @IsNotEmpty()
  forecastTimestamp: number;

  // Localização
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  // Dados meteorológicos principais
  @IsNumber()
  @Min(-50)
  @Max(60)
  temperature: number;

  @IsNumber()
  @Min(-50)
  @Max(60)
  feelsLike: number;

  @IsNumber()
  @Min(-50)
  @Max(60)
  tempMin: number;

  @IsNumber()
  @Min(-50)
  @Max(60)
  tempMax: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  // Condições do tempo
  @IsString()
  @IsNotEmpty()
  weatherCondition: string;

  @IsString()
  @IsNotEmpty()
  weatherDescription: string;

  // Dados para detecção de chuva e alertas
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rainProbability?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rainVolume?: number;

  // Outros dados úteis
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  cloudiness?: number;

  @IsNumber()
  @Min(0)
  windSpeed: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  visibility?: number;
}
