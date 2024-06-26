import { gql } from "@apollo/client";
export const REGISTER_REQUEST_MUTATION = gql`
  mutation Register($registerRequest: RegisterRequest!) {
    register(registerRequest: $registerRequest) {
      id
    }
  }
`;

export const CONFIRM_USER_MUTATION = gql`
  mutation Confirm($confirmUserRequest: ConfirmUserRequest!) {
    confirm(confirmUserRequest: $confirmUserRequest) {
      id
      jwt
      refreshToken
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($authenticateRequest: AuthenticateRequest!) {
    login(authenticateRequest: $authenticateRequest) {
      id
      email
      jwt
      refreshToken
      isValid
    }
  }
`;

export const SEND_CONFIRMATION_CODE_MUTATION = gql`
  mutation SendConfirmationCode($email: String!) {
    sendConfirmationCode(email: $email)
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($deleteUserRequest: DeleteUserRequest!) {
    delete(deleteUserRequest: $deleteUserRequest)
  }
`;

// dtos -

// interface AuthenticateRequest {
//   username: string;

//   password: string;
// }

// interface RegisterRequest {
//   profileUsername: string;

//   email: string;

//   password: string;

//   phoneNumber?: string;
// }

// interface ConfirmUserRequest {
//   code: string;

//   email: string;

//   password: string;
// }

// interface DeleteUserRequest {
//   email: string;
// }
