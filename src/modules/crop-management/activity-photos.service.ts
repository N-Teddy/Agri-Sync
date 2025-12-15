import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageType } from '../../common/enums/image-type.enum';
import { ImageUploadService } from '../../common/services/image-upload.service';
import { ActivityPhoto } from '../../entities/activity-photo.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { FieldAccessService } from '../fields/field-access.service';
import { UploadActivityPhotoDto } from './dto/upload-activity-photo.dto';

@Injectable()
export class ActivityPhotosService {
	private readonly logger = new Logger(ActivityPhotosService.name);

	constructor(
		@InjectRepository(ActivityPhoto)
		private readonly activityPhotosRepository: Repository<ActivityPhoto>,
		@InjectRepository(FieldActivity)
		private readonly fieldActivitiesRepository: Repository<FieldActivity>,
		private readonly imageUploadService: ImageUploadService,
		private readonly fieldAccessService: FieldAccessService
	) {}

	async uploadPhoto(
		userId: string,
		fieldId: string,
		activityId: string,
		file: Express.Multer.File,
		dto: UploadActivityPhotoDto
	): Promise<ActivityPhoto> {
		// Verify user owns the field
		await this.fieldAccessService.getOwnedField(fieldId, userId);

		// Get the activity
		const activity = await this.fieldActivitiesRepository.findOne({
			where: { id: activityId, field: { id: fieldId } },
			relations: ['field'],
		});

		if (!activity) {
			throw new NotFoundException('Activity not found');
		}

		// Validate file type
		if (!file.mimetype.startsWith('image/')) {
			throw new BadRequestException('File must be an image');
		}

		// Upload image
		const uploadedImage = await this.imageUploadService.uploadImage(
			file,
			ImageType.ACTIVITY,
			{
				maxWidth: 1920,
				maxHeight: 1080,
				quality: 85,
			}
		);

		// Save photo record
		const photo = this.activityPhotosRepository.create({
			activity,
			photoUrl: uploadedImage.url,
			publicId: uploadedImage.publicId,
			caption: dto.caption,
			width: uploadedImage.width,
			height: uploadedImage.height,
			fileSize: uploadedImage.size,
			takenAt: new Date(),
		});

		const saved = await this.activityPhotosRepository.save(photo);

		this.logger.log(
			`Photo uploaded for activity ${activityId} by user ${userId}`
		);

		return saved;
	}

	async getActivityPhotos(
		userId: string,
		fieldId: string,
		activityId: string
	): Promise<ActivityPhoto[]> {
		// Verify user owns the field
		await this.fieldAccessService.getOwnedField(fieldId, userId);

		// Get photos
		const photos = await this.activityPhotosRepository.find({
			where: { activity: { id: activityId, field: { id: fieldId } } },
			order: { takenAt: 'DESC' },
		});

		return photos;
	}

	async deletePhoto(
		userId: string,
		fieldId: string,
		activityId: string,
		photoId: string
	): Promise<void> {
		// Verify user owns the field
		await this.fieldAccessService.getOwnedField(fieldId, userId);

		// Get the photo
		const photo = await this.activityPhotosRepository.findOne({
			where: {
				id: photoId,
				activity: { id: activityId, field: { id: fieldId } },
			},
		});

		if (!photo) {
			throw new NotFoundException('Photo not found');
		}

		// Delete from storage
		try {
			if (photo.publicId) {
				await this.imageUploadService.deleteImage(photo.publicId);
			} else {
				// Extract relative path from URL for local storage
				const urlParts = photo.photoUrl.split('/uploads/');
				if (urlParts.length === 2) {
					await this.imageUploadService.deleteImage(urlParts[1]);
				}
			}
		} catch (error) {
			this.logger.warn(
				`Failed to delete image file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
			// Continue with database deletion even if file deletion fails
		}

		// Delete from database
		await this.activityPhotosRepository.remove(photo);

		this.logger.log(
			`Photo ${photoId} deleted from activity ${activityId} by user ${userId}`
		);
	}
}
