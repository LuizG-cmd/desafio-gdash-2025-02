import { Module } from '@nestjs/common';
import { InsightsController } from './presentation/insights.controller';
import { InsightsService } from './services/insights.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherSchema } from 'src/weather/schemas/weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WeatherLog.name,
        schema: WeatherSchema,
      },
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
