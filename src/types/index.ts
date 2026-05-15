import { PrismaClient } from '../generated/prisma/client.js';
import {
  AuthorizationCodeModel,
  ClientCredentialsModel,
  RefreshTokenModel,
  PasswordModel,
  ExtensionModel,
} from 'oauth2-server';

type Oauth2ServerModel =
  | AuthorizationCodeModel
  | ClientCredentialsModel
  | RefreshTokenModel
  | PasswordModel
  | ExtensionModel;

export type Model = {
  prisma: PrismaClient;
} & Oauth2ServerModel;

export type CreateUserParams = {
  email?: string;
  name?: string;
  provider: {
    uid: string;
    name?: string;
    tokenData: any;
  }
};
