import {
  Body,
  Controller,
  Delete,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { mimeTypePipe } from '../pipes/mimeType.pipe';
import 'multer';
import { Auth, RequestWithPayload } from '@backend/auth';
import { UploadResult } from '../inetrfaces/interfaces';

@Controller()
export class fileController {
  constructor(private readonly fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new mimeTypePipe())
  @Auth()
  async uploadFile(
    @Req() req: RequestWithPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: Number(process.env['MAX_FILE_SIZE']!),
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    return await this.fileService.upload(
      {
        key: file.originalname,
        data: file.buffer,
        mimeType: file.mimetype,
      },
      req.body.path,
    );
  }

  @Delete('delete')
  @Auth()
  async deleteFile(
    @Body('path') path: string,
    @Req() req: RequestWithPayload,
  ): Promise<void> {
    await this.fileService.delete(req.user.sub, path);
  }
}
