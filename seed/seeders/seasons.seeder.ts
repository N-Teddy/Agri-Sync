import { ApiClient } from '../utils/api-client';
import { generateSeasonData } from '../utils/data-generators';

export interface PlantingSeason {
    id: string;
    cropType: string;
    plantingDate: string;
    expectedHarvestDate?: string;
}

export class SeasonsSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(fieldId: string, count: number): Promise<PlantingSeason[]> {
        console.log(`      🌾 Creating ${count} planting seasons...`);

        const seasons: PlantingSeason[] = [];

        for (let i = 0; i < count; i++) {
            const data = generateSeasonData();
            const season = await this.apiClient.post<PlantingSeason>(
                `/fields/${fieldId}/seasons`,
                data
            );
            seasons.push(season);
        }

        console.log(`      ✅ Created ${seasons.length} seasons`);
        return seasons;
    }
}
