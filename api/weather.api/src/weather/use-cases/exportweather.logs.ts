import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLog } from '../schemas/weather.schema';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import { WeatherExportData } from '../types/weather-export.type';
import { ExportFileDto } from '../dto/export-file.dto';

@Injectable()
export class exportweather {
  constructor(
    @InjectModel(WeatherLog.name)
    private readonly weathermodel: Model<WeatherLog>,
  ) {}

  async exportcsv(): Promise<ExportFileDto> {
    const data = (await this.weathermodel
      .find()
      .lean()) as unknown as WeatherExportData[];

    const parser = new Parser<WeatherExportData>();
    const csv: string = parser.parse(data);

    return {
      buffer: Buffer.from(csv),
      filename: 'weather-logs.csv',
      contentType: 'text/csv',
    };
  }

  async exportxlsx(): Promise<ExportFileDto> {
    const data = (await this.weathermodel
      .find()
      .lean()) as unknown as WeatherExportData[];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WeatherLogs');

    const buffer: Buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    return {
      buffer,
      filename: 'weather-logs.xlsx',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
