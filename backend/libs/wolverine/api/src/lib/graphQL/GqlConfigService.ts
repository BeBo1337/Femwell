import {
  ApolloDriverConfig,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { RequestContext, Context } from './interfaces';
import { LoggerService } from '@backend/logger';
import { awsConfig, commonConfig } from '@backend/config';

@Injectable()
export class GqlConfigService
  implements GqlOptionsFactory<ApolloFederationDriverConfig>
{
  constructor(
    @Inject(commonConfig.KEY)
    private readonly configService: ConfigType<typeof commonConfig>,
    @Inject(awsConfig.KEY)
    private readonly awsCfg: ConfigType<typeof awsConfig>,
    private readonly loggerService: LoggerService,
  ) {}
  createGqlOptions(): Omit<ApolloDriverConfig, 'driver'> {
    return {
      introspection: !this.configService.isLiveEnv,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      autoSchemaFile: {
        path: join(process.cwd(), 'apps/wv/src/graphQL/schema.gql'),
      },
      context: this.createContext.bind(this),
      playground: false,
      csrfPrevention: false,
      useGlobalPrefix: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    };
  }

  private async createContext(expressContext: any): Promise<Context> {
    const requestContext = await this.getRequestContext(expressContext);
    return {
      requestContext,
      logger: this.loggerService,
      request: expressContext.req,
    };
  }

  private async getRequestContext(
    expressContext: any,
  ): Promise<RequestContext> {
    const requestId = expressContext.req['id'] || randomUUID();
    const requestContext = expressContext.req.headers['context'] as string;
    const jwt = expressContext.req.headers['authorization'] as string;
    if (requestContext)
      return { userPayload: JSON.parse(requestContext), requestId };
    if (jwt) {
      const verifier = CognitoJwtVerifier.create({
        userPoolId: this.awsCfg.userPoolId!,
        tokenUse: 'access',
        clientId: this.awsCfg.clientId ?? null,
      });
      return {
        userPayload: await verifier.verify(jwt),
        requestId,
      };
    }
    throw new UnauthorizedException('Unauthorized: Invalid token');
  }
}
