import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Alert,
  Field,
  FieldActivity,
  FinancialRecord,
  Plantation,
  PlantingSeason,
  User,
  WeatherData,
} from '../../src/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [
        Alert,
        Field,
        FieldActivity,
        FinancialRecord,
        Plantation,
        PlantingSeason,
        User,
        WeatherData,
      ],
      synchronize: true,
      logging: false,
    }),
  ],
})
export class SqliteTestingModule { }
