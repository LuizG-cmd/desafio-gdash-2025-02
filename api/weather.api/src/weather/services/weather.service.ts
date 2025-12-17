import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../schemas/weather.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  /* async createLog(createWeatherLogDto: CreateWeatherDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(createWeatherLogDto);
    return createdLog.save();
  }*/

  /*async listLogs(): Promise<WeatherLog[]> {
    const logs = await this.weatherModel.find().exec();
    return logs;
  }*/
}
