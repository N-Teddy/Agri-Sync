import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { buildTestConfiguration } from './test-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [buildTestConfiguration],
    }),
  ],
})
export class TestConfigModule { }
