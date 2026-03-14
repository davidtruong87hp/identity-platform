import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG and WebP are allowed'
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    return file;
  }
}
