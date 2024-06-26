import { RegisterRequest } from './dto/registerRequest.input';
import { DeleteUserRequest } from './dto/deleteUserRequest.input';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  ICognitoUserData,
} from 'amazon-cognito-identity-js';
import { Inject, Injectable } from '@nestjs/common';
import { AuthenticateRequest } from './dto/authenticateRequest.input';
import { ConfirmUserRequest } from './dto/confirmUserRequest.input';
import { LoggerService } from '@backend/logger';
import { Role } from '@backend/infrastructure';
import { InjectCognitoToken } from './providers/cognito.provider';
import { signUpUser, userSession } from './interfaces/inrefaces';
import {
  AdminUpdateUserAttributesCommand,
  ChangePasswordCommand,
  CognitoIdentityProvider,
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '@backend/config';
import { ConfigType } from '@nestjs/config';
import { InjectWolverineSdk, Sdk, mutationType } from '../wolverine-datasource';
import { randomUUID } from 'node:crypto';
import { AuditService, InjectAuditService } from '@backend/auditService';
import { ChangePasswordInput } from './dto/changePassword.input';
import { InjectAwsService } from '@backend/awsModule';
import { ChangeRoleInput } from './dto/changeRole.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectCognitoToken()
    private readonly userPool: CognitoUserPool,
    @InjectWolverineSdk()
    private readonly wolverineSdk: Sdk,
    private readonly logger: LoggerService,
    @Inject(awsConfig.KEY)
    private readonly awsCfg: ConfigType<typeof awsConfig>,
    @InjectAuditService('auth') private readonly auditService: AuditService,
    @InjectAwsService(CognitoIdentityProvider)
    private readonly cognito: CognitoIdentityProvider,
  ) {}

  async registerUser(registerRequest: RegisterRequest): Promise<signUpUser> {
    const { profileUsername, email, password, phoneNumber } = registerRequest;
    this.logger.info(`${profileUsername} trying to sign up.`);
    const userAttributes = [
      new CognitoUserAttribute({ Name: 'name', Value: profileUsername }),
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: Role.User }),
    ];
    phoneNumber &&
      userAttributes.push(
        new CognitoUserAttribute({ Name: 'phone_number', Value: phoneNumber }),
      );
    return new Promise((resolve, reject) => {
      return this.userPool.signUp(
        email,
        password,
        userAttributes,
        [],
        async (err, result) => {
          if (!result) {
            reject(err);
          } else {
            this.logger.info(
              `user created in cognito user pool: ${this.userPool.getUserPoolId()}`,
            );
            const id = result.userSub;
            try {
              await this.wolverineSdk.sendWolverineMutation(
                mutationType.create,
                {
                  createUserInput: {
                    email,
                    cognitoUserId: id,
                    profileUsername,
                    phoneNumber,
                  },
                },
                this.logger,
              );
            } catch (e: any) {
              this.logger.error(e.message);
              await this.deleteUser({ email });
              reject(e);
            }
            await this.sendConfirmationCode(email);
            await this.sendAuditLog(
              {
                email,
                id,
              },
              'registration',
            );
            resolve({
              email,
              id,
            });
          }
        },
      );
    });
  }

  authenticateUser(
    authenticateRequest: AuthenticateRequest,
  ): Promise<userSession> {
    const authDetails = new AuthenticationDetails({
      Username: authenticateRequest.username,
      Password: authenticateRequest.password,
    });
    const userData: ICognitoUserData = {
      Username: authenticateRequest.username,
      Pool: this.userPool,
    };
    const cognitoUser = new CognitoUser(userData);
    this.logger.info(`${authenticateRequest.username} tries to log in.`);
    return new Promise((resolve, reject) => {
      return cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) =>
          resolve({
            id: result.getIdToken().decodePayload()['sub'],
            isValid: result.isValid(),
            refreshToken: result.getRefreshToken().getToken(),
            jwt: result.getAccessToken().getJwtToken(),
          }),
        onFailure: (err) => reject(err),
      });
    });
  }

  confirmUser(confirmUserRequest: ConfirmUserRequest): Promise<userSession> {
    const userData: ICognitoUserData = {
      Username: confirmUserRequest.email,
      Pool: this.userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    this.logger.info(
      `${confirmUserRequest.email} confirmed his email and now has been verified.`,
    );

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(
        confirmUserRequest.code,
        true,
        async (err, result) => {
          if (err) return reject(err);
          const res = await this.authenticateUser({
            username: confirmUserRequest.email,
            password: confirmUserRequest.password,
          });
          resolve(res);
        },
      );
    });
  }

  sendConfirmationCode(email: string): Promise<string> {
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      return cognitoUser.resendConfirmationCode((err) => {
        if (err) return reject(err);
        resolve('Verification code sent!');
      });
    });
  }

  async deleteUser(deleteUserRequest: DeleteUserRequest): Promise<string> {
    const deleteUserData = {
      Username: deleteUserRequest.email,
      UserPoolId: this.awsCfg.userPoolId,
    };

    const userData = await this.cognito.adminGetUser(deleteUserData);
    const id = userData.UserAttributes?.find(
      (attribute) => attribute.Name === 'sub',
    )?.Value;

    return new Promise((resolve, reject) => {
      return this.cognito.adminDeleteUser(deleteUserData, async (err: any) => {
        if (err) return reject(err);
        this.logger.info(
          `${deleteUserRequest.email} account deleted from cognito.`,
        );
        await this.wolverineSdk.sendWolverineMutation(
          mutationType.delete,
          { id },
          this.logger,
        );
        await this.sendAuditLog(
          { id, email: deleteUserRequest.email },
          'delete',
        );
        resolve('User deleted successfully!');
      });
    });
  }

  async changePassword(
    changePasswordDto: ChangePasswordInput,
  ): Promise<string> {
    const input = {
      PreviousPassword: changePasswordDto.previousPassword,
      ProposedPassword: changePasswordDto.proposedPassword,
      AccessToken: changePasswordDto.accessToken,
    };
    const command = new ChangePasswordCommand(input);
    await this.cognito.send(command);
    return 'Password changed successfully!';
  }

  private async sendAuditLog(
    user: { id: string | undefined; email: string },
    eventType: string,
  ): Promise<string> {
    return this.auditService.auditEvent({
      trigger: {
        id: { type: 'email', value: user.email },
        type: 'External',
      },
      subject: {
        type: 'auth',
        id: `${user.id ?? randomUUID()}`,
        event: {
          type: eventType,
          metaData: { user },
        },
      },
    });
  }

  async changeRole(changeRoleDto: ChangeRoleInput) {
    const input = {
      UserPoolId: this.awsCfg.userPoolId, // required
      Username: changeRoleDto.email, // required
      UserAttributes: [
        {
          Name: 'custom:role',
          Value: changeRoleDto.newRole,
        },
      ],
    };
    try {
      await this.wolverineSdk.sendWolverineMutation(
        mutationType.updateRole,
        {
          updateUserInput: {
            id: changeRoleDto.id,
            username: changeRoleDto.profileUsername,
            role: changeRoleDto.newRole,
          },
        },
        this.logger,
      );
    } catch (e: any) {
      this.logger.error(e.message);
      throw e;
    }
    const command = new AdminUpdateUserAttributesCommand(input);
    await this.cognito.send(command);
    return 'Role changed successfully!';
  }
}
