import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLog } from '../schemas/weather.schema';
import { Model } from 'mongoose';

@Injectable()
export class findLogs {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  async execute(): Promise<WeatherLog[]> {
    const logs = await this.weatherModel.find().exec();
    return logs;
  }
}
