import {
  AuthorizationCodeModel,
  ClientCredentialsModel,
  RefreshTokenModel,
  PasswordModel,
  ExtensionModel,
} from 'oauth2-server';

interface User {
  id: string;
  email: string;
}

export type Model =
  | AuthorizationCodeModel
  | ClientCredentialsModel
  | RefreshTokenModel
  | PasswordModel
  | ExtensionModel;
