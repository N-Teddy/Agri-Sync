import { BaseApiResponse } from '../config';
import { ApiClient } from '../utils/api-client';
import { generateImageBuffer } from '../utils/data-generators';

export interface ActivityPhoto {
    id: string;
    url: string;
    caption?: string;
}

export class PhotosSeeder {
    constructor(private apiClient: ApiClient) { }

    async seed(
        fieldId: string,
        activityId: string,
        count: number
    ): Promise<ActivityPhoto[]> {
        console.log(`            📸 Uploading ${count} photos...`);

        const photos: ActivityPhoto[] = [];
        const imageBuffer = generateImageBuffer();

        for (let i = 0; i < count; i++) {
            const response = await this.apiClient.uploadFile<BaseApiResponse<ActivityPhoto>>(
                `/fields/${fieldId}/activities/${activityId}/photos`,
                imageBuffer,
                `photo-${i}.png`,
                { caption: `Sample photo ${i + 1}` }
            );
            if (response.data) {
                photos.push(response.data);
            }
        }

        console.log(`            ✅ Uploaded ${photos.length} photos`);
        return photos;
    }
}
