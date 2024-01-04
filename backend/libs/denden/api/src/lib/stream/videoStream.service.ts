import {
  BadRequestException,
  Injectable, InternalServerErrorException,
} from '@nestjs/common';
import { LoggerService } from '@backend/logger';
import { CloudFront } from 'aws-sdk';
import { InjectCloudFrontToken } from '../providers/cloudFront.provider';

@Injectable()
export class VideoStreamService {
  constructor(
    @InjectCloudFrontToken() private cloudFront: CloudFront,
    private readonly logger: LoggerService,
  ) {
  }

  async stream(videoName: string, videoId: string): Promise<URL> {
    this.logger.info('fetching video stream url from cloudfront');
    try {
      const res = this.cloudFront.getDistribution({
      Id: videoId,
    });
      const distribution = await res.promise();
      const domainName = distribution.Distribution?.DomainName;
      if (!domainName) throw new BadRequestException();
      this.logger.info(`video stream url fetched successfully`);
      return new URL(`https://${domainName}/${videoName}`);
    } catch (e: any) {
      this.logger.error(`video stream url not found: ${e.message}`);
      if (e instanceof BadRequestException) {
        throw new BadRequestException(`there is not distribution with this id - ${videoId}`);
      }
      throw new InternalServerErrorException(`video stream url not found: ${e.message}`);
    }
  }
}
