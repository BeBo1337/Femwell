import { Global, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './audit-module.definitions';
import { AuditService } from './audit.service';
import { AUDIT_STORE_PROVIDER } from './constants';
import { ConfigType } from '@nestjs/config';
import { awsConfig, commonConfig } from '@backend/config';
import { Kinesis } from '@aws-sdk/client-kinesis';

@Global()
@Module({
  providers: [
    AuditService,
    {
      provide: 'AUDIT_STORE_PROVIDER',
      useFactory: (
        awsCfg: ConfigType<typeof awsConfig>,
        config: ConfigType<typeof commonConfig>,
      ) => {
        return new Kinesis(
          config.isLiveEnv ? {} : awsCfg.localDevConfigOverride,
        );
      },
      inject: [awsConfig.KEY, commonConfig.KEY],
    },
  ],
  exports: [AuditService, MODULE_OPTIONS_TOKEN, AUDIT_STORE_PROVIDER],
})
export class AuditCoreModule extends ConfigurableModuleClass {}
