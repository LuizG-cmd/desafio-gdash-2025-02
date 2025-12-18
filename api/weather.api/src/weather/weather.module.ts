import { Module } from '@nestjs/common';
import { WeatherController } from './presentation/weather.controller';
import { WeatherService } from './services/weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherSchema } from './schemas/weather.schema';
import { createLogs } from './use-cases/create.logs';
import { findLogs } from './use-cases/find.logs';
import { exportweather } from './use-cases/exportweather.logs';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WeatherLog.name,
        schema: WeatherSchema,
      },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, createLogs, findLogs, exportweather],
})
export class WeatherModule {}
