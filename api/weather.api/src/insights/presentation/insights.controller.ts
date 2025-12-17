import { Controller, Get } from '@nestjs/common';
import { InsightsService } from '../services/insights.service';

@Controller('')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get('api/insights/gemini')
  async generateText() {
    return await this.insights.generateText();
  }
}
