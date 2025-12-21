import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      throw new Error('API KEY not found');
    }

    this.GenIa = new GoogleGenerativeAI(GeminiKey);
  }

  async generateText() {
    try {
      const model = this.GenIa.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const promptdata = await this.weatherModel
        .find()
        .sort({ createdAt: -1 })
        .limit(40)
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

      Por favor, forneça insights como se fossem cards para que eu possa utilizar em meu frontend
    `);

      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to call Gemini Api',
        error.message,
      );
    }
  }
}
