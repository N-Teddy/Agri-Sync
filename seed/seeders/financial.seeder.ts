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
            const record = await this.apiClient.post<FinancialRecord>(
                `/fields/${fieldId}/financial-records`,
                data
            );
            records.push(record);
        }

        console.log(`      ✅ Created ${records.length} financial records`);
        return records;
    }
}
