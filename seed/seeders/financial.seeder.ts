import { BaseApiResponse } from '../config';
import { ApiClient } from '../utils/api-client';
import { generateFinancialData } from '../utils/data-generators';

export interface FinancialRecord {
    id: string;
    amountXaf: string;
    recordType: string;
    recordDate: string;
}

export class FinancialSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(fieldId: string, count: number): Promise<FinancialRecord[]> {
        console.log(`      💰 Creating ${count} financial records...`);

        const records: FinancialRecord[] = [];

        for (let i = 0; i < count; i++) {
            const { recordType, ...payload } = generateFinancialData();
            const endpoint =
                recordType === 'cost'
                    ? `/fields/${fieldId}/financial-records/costs`
                    : `/fields/${fieldId}/financial-records/revenue`;

            const response = await this.apiClient.post<BaseApiResponse<FinancialRecord>>(
                endpoint,
                payload
            );
            if (response.data) {
                records.push(response.data);
            }
        }

        console.log(`      ✅ Created ${records.length} financial records`);
        return records;
    }
}
