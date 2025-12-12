import { ApiClient } from '../utils/api-client';
import { generateFieldData } from '../utils/data-generators';

export interface Field {
    id: string;
    name: string;
    areaHectares: string;
    soilType?: string;
    currentCrop?: string;
}

export class FieldsSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(plantationId: string, count: number): Promise<Field[]> {
        console.log(`   📍 Creating ${count} fields for plantation ${plantationId}...`);

        const fields: Field[] = [];

        for (let i = 0; i < count; i++) {
            const data = generateFieldData();
            const field = await this.apiClient.post<Field>(
                `/plantations/${plantationId}/fields`,
                data
            );
            fields.push(field);
        }

        console.log(`   ✅ Created ${fields.length} fields`);
        return fields;
    }
}
