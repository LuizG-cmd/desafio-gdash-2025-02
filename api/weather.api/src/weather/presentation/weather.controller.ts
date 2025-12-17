import { Controller, Post, Body, Get } from '@nestjs/common';
/*import { WeatherService } from '../services/weather.service';*/
import { CreateWeatherDto } from '../dto/weather.dto';
import { createLogs } from '../use-cases/create.logs';
import { findLogs } from '../use-cases/find.logs';

@Controller()
export class WeatherController {
  constructor(
    /*private readonly weatherservice: WeatherService,*/
    private readonly createLogs: createLogs,
    private readonly findLogs: findLogs,
  ) {}

  @Post('api/weather/logs')
  async create(@Body() createWeatherDto: CreateWeatherDto) {
    return await this.createLogs.execute(createWeatherDto);
  }

  @Get('api/weather/logs')
  async list() {
    return await this.findLogs.execute();
  }
}
