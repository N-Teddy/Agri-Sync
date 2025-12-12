import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import {
    CurrentUser,
    RequestUser,
} from '../../common/decorators/current-user.decorator';
import { ActivityPhoto } from '../../entities/activity-photo.entity';
import { ActivityPhotosService } from './activity-photos.service';
import { UploadActivityPhotoDto } from './dto/upload-activity-photo.dto';

@ApiBearerAuth()
@ApiTags('Field Activities - Photos')
@Controller({
    path: 'fields/:fieldId/activities/:activityId/photos',
    version: '1',
})
export class ActivityPhotosController {
    constructor(
        private readonly activityPhotosService: ActivityPhotosService
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('photo'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a photo for an activity' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                photo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (JPEG, PNG, etc.)',
                },
                caption: {
                    type: 'string',
                    description: 'Optional caption for the photo',
                    maxLength: 255,
                },
            },
            required: ['photo'],
        },
    })
    uploadPhoto(
        @CurrentUser() user: RequestUser,
        @Param('fieldId', ParseUUIDPipe) fieldId: string,
        @Param('activityId', ParseUUIDPipe) activityId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadActivityPhotoDto
    ): Promise<ActivityPhoto> {
        return this.activityPhotosService.uploadPhoto(
            user.sub,
            fieldId,
            activityId,
            file,
            dto
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all photos for an activity' })
    getPhotos(
        @CurrentUser() user: RequestUser,
        @Param('fieldId', ParseUUIDPipe) fieldId: string,
        @Param('activityId', ParseUUIDPipe) activityId: string
    ): Promise<ActivityPhoto[]> {
        return this.activityPhotosService.getActivityPhotos(
            user.sub,
            fieldId,
            activityId
        );
    }

    @Delete(':photoId')
    @ApiOperation({ summary: 'Delete a photo' })
    deletePhoto(
        @CurrentUser() user: RequestUser,
        @Param('fieldId', ParseUUIDPipe) fieldId: string,
        @Param('activityId', ParseUUIDPipe) activityId: string,
        @Param('photoId', ParseUUIDPipe) photoId: string
    ): Promise<void> {
        return this.activityPhotosService.deletePhoto(
            user.sub,
            fieldId,
            activityId,
            photoId
        );
    }
}
