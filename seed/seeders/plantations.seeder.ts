import { ApiClient } from '../utils/api-client';
import { generatePlantationData } from '../utils/data-generators';

export interface Plantation {
    id: string;
    name: string;
    location: string;
}

export class PlantationsSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(count: number): Promise<Plantation[]> {
        console.log(`🏞️  Creating ${count} plantations...`);

        const plantations: Plantation[] = [];

        for (let i = 0; i < count; i++) {
            const data = generatePlantationData();
            const plantation = await this.apiClient.post<Plantation>(
                '/plantations',
                data
            );
            plantations.push(plantation);
        }

        console.log(`✅ Created ${plantations.length} plantations`);
        return plantations;
    }
}
