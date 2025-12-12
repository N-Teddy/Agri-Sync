import { BaseApiResponse } from '../config';
import { ApiClient } from '../utils/api-client';
import { generateActivityData } from '../utils/data-generators';

export interface FieldActivity {
    id: string;
    activityType: string;
    activityDate: string;
    notes?: string;
}

export class ActivitiesSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(
        fieldId: string,
        seasonId: string,
        seasonStartDate: string,
        count: number
    ): Promise<FieldActivity[]> {
        console.log(`         🚜 Creating ${count} activities...`);

        const activities: FieldActivity[] = [];
        const seasonStart = new Date(seasonStartDate);

        for (let i = 0; i < count; i++) {
            const data = {
                ...generateActivityData(seasonStart),
                plantingSeasonId: seasonId,
            };

            const response = await this.apiClient.post<BaseApiResponse<FieldActivity>>(
                `/fields/${fieldId}/activities`,
                data
            );
            if (response.data) {
                activities.push(response.data);
            }
        }

        console.log(`         ✅ Created ${activities.length} activities`);
        return activities;
    }
}
