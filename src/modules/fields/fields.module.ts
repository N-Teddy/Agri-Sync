import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field } from '../../entities/field.entity';

import { FieldAccessService } from './field-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([Field])],
  providers: [FieldAccessService],
  exports: [FieldAccessService],
})
export class FieldsModule { }
