import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLog } from '../schemas/weather.schema';
import { Model } from 'mongoose';
import { CreateWeatherDto } from '../dto/weather.dto';

@Injectable()
export class createLogs {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  async execute(createWeatherLogDto: CreateWeatherDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(createWeatherLogDto);
    return createdLog.save();
  }
}
