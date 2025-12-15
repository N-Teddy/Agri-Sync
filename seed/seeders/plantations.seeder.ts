import { BaseApiResponse } from '../config';
import { ApiClient } from '../utils/api-client';
import { generatePlantationData } from '../utils/data-generators';

export interface Plantation {
    id: string;
    name: string;
    location: string;
    region: string;
}

export class PlantationsSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(count: number): Promise<Plantation[]> {
        console.log(`🏞️  Creating ${count} plantations...`);

        const plantations: Plantation[] = [];

        for (let i = 0; i < count; i++) {
            const data = generatePlantationData();
            const response = await this.apiClient.post<BaseApiResponse<Plantation>>(
                '/plantations',
                data
            );
            if (response.data) {
                plantations.push(response.data);
            }
        }

        console.log(`✅ Created ${plantations.length} plantations`);
        return plantations;
    }
}
