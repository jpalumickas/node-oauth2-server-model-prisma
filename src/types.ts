import type {
  AuthorizationCodeModel,
  ClientCredentialsModel,
  RefreshTokenModel,
  PasswordModel,
  ExtensionModel,
} from 'oauth2-server';

type PrismaDelegate = {
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

export interface OAuthPrismaClient {
  oauthAccessToken: PrismaDelegate;
  oauthAccessGrant: PrismaDelegate;
  oauthApplication: PrismaDelegate;
  [key: string]: any;
}

type Oauth2ServerModel =
  | AuthorizationCodeModel
  | ClientCredentialsModel
  | RefreshTokenModel
  | PasswordModel
  | ExtensionModel;

export type Model = {
  prisma: OAuthPrismaClient;
} & Oauth2ServerModel;

export type CreateUserParams = {
  email?: string;
  name?: string;
  provider: {
    uid: string;
    name?: string;
    tokenData: any;
  };
};
