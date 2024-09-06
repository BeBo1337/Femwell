import { Module } from '@nestjs/common';
import { fileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  controllers: [fileController],
  providers: [FileService],
})
export class FileModule {}
