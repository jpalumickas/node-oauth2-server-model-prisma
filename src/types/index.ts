import { PrismaClient } from '@prisma/client';
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
