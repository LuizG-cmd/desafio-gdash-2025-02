import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  // Identificação temporal
  @Prop({ required: true })
  collectedAt: string; // ISO 8601 timestamp de quando foi coletado

  @Prop({ required: true })
  forecastTime: string; // Data/hora da previsão (YYYY-MM-DD HH:MM:SS)

  @Prop({ required: true })
  forecastTimestamp: number; // Unix timestamp da previsão

  // Localização
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  // Dados meteorológicos principais
  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  feelsLike: number;

  @Prop({ required: true })
  tempMin: number;

  @Prop({ required: true })
  tempMax: number;

  @Prop({ required: true })
  humidity: number;

  // Condições do tempo
  @Prop({ required: true })
  weatherCondition: string;

  @Prop({ required: true })
  weatherDescription: string;

  // Dados para detecção de chuva e alertas
  @Prop({ required: true, default: 0 })
  rainProbability: number;

  @Prop({ default: 0 })
  rainVolume: number;

  // Outros dados úteis
  @Prop({ default: 0 })
  cloudiness: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ default: 10000 })
  visibility: number;
}

export const WeatherSchema = SchemaFactory.createForClass(WeatherLog);
