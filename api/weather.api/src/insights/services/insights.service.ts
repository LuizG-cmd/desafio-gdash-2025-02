import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from 'src/weather/schemas/weather.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InsightsService {
  private GenIa: GoogleGenerativeAI;

  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
    configService: ConfigService,
  ) {
    const GeminiKey = configService.get<string>('GEMINI_API_KEY');

    if (!GeminiKey) {
      throw new Error('Chave não localizada');
    }

    this.GenIa = new GoogleGenerativeAI(GeminiKey);
  }

  async generateText() {
    const model = this.GenIa.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promptdata = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    const formatdata = JSON.stringify(promptdata, null, 2);

    const result = await model.generateContent(`
      Analise os seguintes dados meteorológicos e calcule:
      - Média de temperatura
      - Média de umidade
      - Períodos mais quentes e mais frios
      - Tendências observadas

      Dados:
      ${formatdata}

      Por favor, forneça insights claros e objetivos.
    `);

    return result.response.text();
  }
}
