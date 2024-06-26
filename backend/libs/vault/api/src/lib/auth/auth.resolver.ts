import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RegisterRequest } from './dto/registerRequest.input';
import { AuthenticateRequest } from './dto/authenticateRequest.input';
import { AuthService } from './auth.service';
import { ConfirmUserRequest } from './dto/confirmUserRequest.input';
import { RateLimit } from '@backend/infrastructure';
import { GraphQLString } from 'graphql/type';
import { AuthUser } from '../authUser/authUser.entity';
import { DeleteUserRequest } from './dto/deleteUserRequest.input';
import { SignedUpUser } from '../authUser/signedUpUser.entity';
import { userSession } from './interfaces/inrefaces';
import { ChangePasswordInput } from './dto/changePassword.input';
import { ChangeRoleInput } from './dto/changeRole.input';
import { Auth } from '@backend/auth';

@Resolver(() => AuthUser)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignedUpUser)
  async register(
    @Args('registerRequest') registerRequest: RegisterRequest,
  ): Promise<SignedUpUser> {
    const signUpResult = await this.authService.registerUser(registerRequest);
    return {
      id: signUpResult.id,
      email: registerRequest.email,
    };
  }

  @Mutation(() => AuthUser)
  @RateLimit({
    errorMessage: 'Too many login attempts. Please try again later.',
  })
  async login(
    @Args('authenticateRequest') authenticateRequest: AuthenticateRequest,
  ): Promise<AuthUser> {
    const res = await this.authService.authenticateUser(authenticateRequest);
    return {
      id: res.id,
      email: authenticateRequest.username,
      jwt: res.jwt,
      refreshToken: res.refreshToken,
      isValid: res.isValid,
    };
  }

  @Mutation(() => AuthUser)
  async confirm(
    @Args('confirmUserRequest') confirmUserRequest: ConfirmUserRequest,
  ): Promise<userSession> {
    return await this.authService.confirmUser(confirmUserRequest);
  }

  @Mutation(() => GraphQLString)
  async sendConfirmationCode(
    @Args('email', { type: () => String }) email: string,
  ): Promise<string> {
    return await this.authService.sendConfirmationCode(email);
  }

  @Mutation(() => GraphQLString)
  @Auth()
  async delete(
    @Args('deleteUserRequest') deleteUserRequest: DeleteUserRequest,
  ): Promise<string> {
    return await this.authService.deleteUser(deleteUserRequest);
  }

  @Mutation(() => GraphQLString)
  @Auth()
  async changePassword(
    @Args('changePasswordInput') changePasswordInput: ChangePasswordInput,
  ) {
    return this.authService.changePassword(changePasswordInput);
  }

  @Mutation(() => GraphQLString)
  @Auth()
  async changeRole(
    @Args('ChangeRoleInput') changeRoleInput: ChangeRoleInput,
  ): Promise<string> {
    return await this.authService.changeRole(changeRoleInput);
  }
}
