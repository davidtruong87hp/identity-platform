import { BadRequestException } from '@nestjs/common';
import { AvatarValidationPipe } from './avatar-validation.pipe';

const mockFile = (mimetype: string, size: number) =>
  ({
    fieldname: 'file',
    originalname: 'avatar.jpg',
    encoding: '7bit',
    mimetype,
    buffer: Buffer.alloc(size),
    size,
  } as Express.Multer.File);

describe('AvatarValidationPipe', () => {
  let pipe: AvatarValidationPipe;

  beforeEach(() => {
    pipe = new AvatarValidationPipe();
  });

  it('should throw if no file provided', () => {
    expect(() => pipe.transform(null as any)).toThrow(BadRequestException);
  });

  it('should throw if file type is not allowed', () => {
    const file = mockFile('image/gif', 1024);
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw if file size exceeds 5MB', () => {
    const file = mockFile('image/jpeg', 6 * 1024 * 1024);
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should pass for valid JPEG file', () => {
    const file = mockFile('image/jpeg', 1024);
    expect(pipe.transform(file)).toEqual(file);
  });

  it('should pass for valid PNG file', () => {
    const file = mockFile('image/png', 1024);
    expect(pipe.transform(file)).toEqual(file);
  });

  it('should pass for valid WebP file', () => {
    const file = mockFile('image/webp', 1024);
    expect(pipe.transform(file)).toEqual(file);
  });
});
