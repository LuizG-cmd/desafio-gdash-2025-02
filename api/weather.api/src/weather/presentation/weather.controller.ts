import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import express from 'express';
/*import { WeatherService } from '../services/weather.service';*/
import { CreateWeatherDto } from '../dto/weather.dto';
import { createLogs } from '../use-cases/create.logs';
import { findLogs } from '../use-cases/find.logs';
import { exportweather } from '../use-cases/exportweather.logs';

@Controller()
export class WeatherController {
  constructor(
    /*private readonly weatherservice: WeatherService,*/
    private readonly createLogs: createLogs,
    private readonly findLogs: findLogs,
    private exportWeather: exportweather,
  ) {}

  @Post('api/weather/logs')
  async create(@Body() createWeatherDto: CreateWeatherDto) {
    return await this.createLogs.execute(createWeatherDto);
  }

  @Get('api/weather/logs')
  async list() {
    return await this.findLogs.execute();
  }

  @Get('api/weather/csv')
  async exportCsv(@Res() res: express.Response) {
    const result = await this.exportWeather.exportcsv();

    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${result.filename}`,
    );

    return res.send(result.buffer);
  }

  @Get('api/weather/xlsx')
  async exportXlsx(@Res() res: express.Response) {
    const result = await this.exportWeather.exportxlsx();

    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${result.filename}`,
    );

    return res.send(result.buffer);
  }
}
