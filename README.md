# Prisma model for node OAuth2 Server

## Installation

Using Yarn
```sh
yarn add oauth2-server-model-prisma
```

Using NPM

```sh
npm install oauth2-server-model-prisma
```

## Usage

```js
  import model from 'oauth2-server-model-prisma';

  const server = new OAuth2Server({
    model: {
      ...model({ prisma }),
    },
    requireClientAuthentication: {
      password: false,
      refresh_token: false,
    },
  });
```

### Prisma Schema
```groovy

model OauthAccessToken {
  id                    String           @default(dbgenerated()) @id
  userId                String
  applicationId         String
  token                 String           @unique
  refreshToken          String?          @unique
  tokenExpiresAt        DateTime?
  refreshTokenExpiresAt DateTime?
  scopes                Json             @default("[]")
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @default(now()) @updatedAt
  application           OauthApplication @relation(fields: [applicationId], references: [id])
  user                  User             @relation(fields: [userId], references: [id])

  @@index([applicationId])
  @@index([userId])
}

model OauthAccessGrant {
  id            String           @default(dbgenerated()) @id
  userId        String
  applicationId String
  token         String           @unique
  expiresAt     DateTime
  redirectUri   String
  codeChallengeMethod String?
  codeChallenge String?
  scopes        Json             @default("[]")
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @default(now()) @updatedAt
  application   OauthApplication @relation(fields: [applicationId], references: [id])
  user          User             @relation(fields: [userId], references: [id])

  @@index([applicationId])
  @@index([userId])
}

model OauthApplication {
  id           String             @default(dbgenerated()) @id
  name         String
  clientId     String             @unique
  clientSecret String
  redirectUris Json               @default("[]")
  scopes       Json               @default("[]")
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @default(now()) @updatedAt
  grants       Json               @default("[]")
  accessTokens OauthAccessToken[]
  accessGrants OauthAccessGrant[]
}

model User {
  id                String             @default(dbgenerated()) @id
  name              String
  email             String             @unique
  encryptedPassword String
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @default(now()) @updatedAt
  accessTokens      OauthAccessToken[]
  accessGrants      OauthAccessGrant[]
  identities        UserIdentity[]
}

model UserIdentity {
  id        String   @default(dbgenerated()) @id
  userId    String
  provider  String
  uid       String
  name      String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@unique([provider, uid])
}
```

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

[oauth2-server]: https://github.com/oauthjs/node-oauth2-server
