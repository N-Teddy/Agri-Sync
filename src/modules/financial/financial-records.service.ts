import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { FinancialRecordType } from '../../common/enums/financial-record-type.enum';
import { normalizeDateInput } from '../../common/utils/date.util';
import { Field } from '../../entities/field.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { FieldAccessService } from '../fields/field-access.service';
import { FinancialRecordsFilterDto } from './dto/financial-records-filter.dto';
import { RecordCostDto } from './dto/record-cost.dto';
import { RecordRevenueDto } from './dto/record-revenue.dto';

export interface FieldFinancialSummary {
  fieldId: string;
  fieldName: string;
  totalCostsXaf: number;
  totalRevenueXaf: number;
  profitXaf: number;
  profitStatus: 'profit' | 'loss' | 'breakeven';
}

interface ActivityCostPayload {
  amountXaf: number;
  recordDate: string;
  productName?: string;
  description?: string;
}

@Injectable()
export class FinancialRecordsService {
  constructor(
    @InjectRepository(FinancialRecord)
    private readonly financialRecordsRepository: Repository<FinancialRecord>,
    private readonly fieldAccessService: FieldAccessService,
  ) { }

  async recordCost(
    ownerId: string,
    fieldId: string,
    dto: RecordCostDto,
  ): Promise<FinancialRecord> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    const recordDate = normalizeDateInput(dto.recordDate);

    return this.saveCostRecord(field, {
      amountXaf: dto.amountXaf,
      recordDate,
      description: dto.description,
      productName: dto.productName,
    });
  }

  async recordRevenue(
    ownerId: string,
    fieldId: string,
    dto: RecordRevenueDto,
  ): Promise<FinancialRecord> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    const recordDate = normalizeDateInput(dto.recordDate);

    const quantityKg = this.formatDecimal(dto.quantityKg);
    const pricePerKg = this.formatDecimal(dto.pricePerKgXaf);
    const totalRevenue =
      parseFloat(quantityKg) * parseFloat(pricePerKg);

    const record = this.financialRecordsRepository.create({
      field,
      recordType: FinancialRecordType.REVENUE,
      recordDate,
      amountXaf: this.formatDecimal(totalRevenue),
      description: dto.description,
      cropType: dto.cropType,
      quantityKg,
      pricePerKgXaf: pricePerKg,
      productName: dto.buyerName,
    });

    return this.financialRecordsRepository.save(record);
  }

  async getRecords(
    ownerId: string,
    fieldId: string,
    filters: FinancialRecordsFilterDto,
  ): Promise<FinancialRecord[]> {
    await this.fieldAccessService.getOwnedField(fieldId, ownerId);

    const query = this.financialRecordsRepository
      .createQueryBuilder('record')
      .where('record.fieldId = :fieldId', { fieldId })
      .orderBy('record.recordDate', 'DESC')
      .addOrderBy('record.createdAt', 'DESC');

    if (filters.recordType) {
      query.andWhere('record.recordType = :recordType', {
        recordType: filters.recordType,
      });
    }

    if (filters.startDate) {
      query.andWhere('record.recordDate >= :startDate', {
        startDate: normalizeDateInput(filters.startDate),
      });
    }

    if (filters.endDate) {
      query.andWhere('record.recordDate <= :endDate', {
        endDate: normalizeDateInput(filters.endDate),
      });
    }

    return query.getMany();
  }

  async getFieldSummary(
    ownerId: string,
    fieldId: string,
  ): Promise<FieldFinancialSummary> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    const records = await this.financialRecordsRepository.find({
      where: { field: { id: field.id } },
    });

    return this.buildSummaryForField(field, records);
  }

  async summarizeFields(fields: Field[]): Promise<FieldFinancialSummary[]> {
    if (!fields.length) {
      return [];
    }

    const fieldIds = fields.map((field) => field.id);
    const records = await this.financialRecordsRepository.find({
      where: { field: { id: In(fieldIds) } },
      relations: {
        field: true,
      },
    });

    const recordsByField = fieldIds.reduce<Record<string, FinancialRecord[]>>(
      (acc, fieldId) => {
        acc[fieldId] = [];
        return acc;
      },
      {},
    );

    for (const record of records) {
      const recordFieldId = record.field?.id;
      if (recordFieldId && recordsByField[recordFieldId]) {
        recordsByField[recordFieldId].push(record);
      }
    }

    return fields.map((field) =>
      this.buildSummaryForField(field, recordsByField[field.id] ?? []),
    );
  }

  async recordActivityCost(
    field: Field,
    payload: ActivityCostPayload,
  ): Promise<void> {
    if (payload.amountXaf <= 0) {
      return;
    }

    const recordDate = normalizeDateInput(payload.recordDate);
    await this.saveCostRecord(field, {
      amountXaf: payload.amountXaf,
      recordDate,
      description: payload.description,
      productName: payload.productName,
    });
  }

  private async saveCostRecord(
    field: Field,
    payload: ActivityCostPayload,
  ): Promise<FinancialRecord> {
    const record = this.financialRecordsRepository.create({
      field,
      recordType: FinancialRecordType.COST,
      recordDate: payload.recordDate,
      amountXaf: this.formatDecimal(payload.amountXaf),
      description: payload.description,
      productName: payload.productName,
    });

    return this.financialRecordsRepository.save(record);
  }

  private buildSummaryForField(
    field: Field,
    records: FinancialRecord[],
  ): FieldFinancialSummary {
    let totalCosts = 0;
    let totalRevenue = 0;

    for (const record of records) {
      const amount = parseFloat(record.amountXaf ?? '0') || 0;
      if (record.recordType === FinancialRecordType.COST) {
        totalCosts += amount;
      } else {
        totalRevenue += amount;
      }
    }

    const profit = totalRevenue - totalCosts;
    let profitStatus: FieldFinancialSummary['profitStatus'] = 'breakeven';

    if (profit > 0) {
      profitStatus = 'profit';
    } else if (profit < 0) {
      profitStatus = 'loss';
    }

    return {
      fieldId: field.id,
      fieldName: field.name,
      totalCostsXaf: Number(totalCosts.toFixed(2)),
      totalRevenueXaf: Number(totalRevenue.toFixed(2)),
      profitXaf: Number(profit.toFixed(2)),
      profitStatus,
    };
  }

  private formatDecimal(value: number): string {
    return value.toFixed(2);
  }
}
