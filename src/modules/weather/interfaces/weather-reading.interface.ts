export interface NormalizedWeatherReading {
  recordedAt: Date;
  temperatureC?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  isForecast: boolean;
  source: string;
}
