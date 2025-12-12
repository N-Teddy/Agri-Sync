import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
	CurrentUser,
	RequestUser,
} from '../../common/decorators/current-user.decorator';
import { WeatherForecastQueryDto } from './dto/weather-forecast-query.dto';
import { WeatherObservation, WeatherService } from './weather.service';

@ApiBearerAuth()
@ApiTags('Weather')
@Controller({
	path: 'fields/:fieldId/weather',
	version: '1',
})
export class WeatherController {
	constructor(private readonly weatherService: WeatherService) {}

	@Get('current')
	getCurrentWeather(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string
	): Promise<WeatherObservation> {
		return this.weatherService.getCurrentWeather(user.sub, fieldId);
	}

	@Get('forecast')
	getForecast(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Query() query: WeatherForecastQueryDto
	): Promise<WeatherObservation[]> {
		return this.weatherService.getForecast(user.sub, fieldId, query);
	}
}
