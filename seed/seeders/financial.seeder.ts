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
            const data = generateFinancialData();
            const response = await this.apiClient.post<BaseApiResponse<FinancialRecord>>(
                `/fields/${fieldId}/financial-records`,
                data
            );
            if (response.data) {
                records.push(response.data);
            }
        }

        console.log(`      ✅ Created ${records.length} financial records`);
        return records;
    }
}
