import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadActivityPhotoDto {
    @ApiPropertyOptional({
        description: 'Caption for the photo',
        maxLength: 255,
        example: 'Fertilizer application on Field A',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    caption?: string;
}
