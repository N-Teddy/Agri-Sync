import { Global, Module } from '@nestjs/common';

import { CloudinaryService } from '../third-party/cloudinary.service';
import { ImageUploadService } from './image-upload.service';
import { LocalStorageService } from './local-storage.service';

@Global()
@Module({
    providers: [LocalStorageService, CloudinaryService, ImageUploadService],
    exports: [LocalStorageService, CloudinaryService, ImageUploadService],
})
export class CommonServicesModule { }
