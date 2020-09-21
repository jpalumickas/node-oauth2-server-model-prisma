# Prisma model for node OAuth2 Server

## Installation

Using Yarn
```sh
yarn add oauth2-server-grant-type-apple
```

Using NPM

```sh
npm install oauth2-server-grant-type-apple
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
  id            String           @default(dbgenerated()) @id
  userId        String
  applicationId String
  token         String           @unique
  refreshToken  String?          @unique
  expiresAt     String?
  createdAt     DateTime
  updatedAt     DateTime         @updatedAt
  application   OauthApplication @relation(fields: [applicationId], references: [id])
  user          User             @relation(fields: [userId], references: [id])

  @@index([applicationId], name: "index_oauth_access_tokens_on_application_id")
  @@index([userId], name: "index_oauth_access_tokens_on_user_id")
}

model OauthApplication {
  id           String             @default(dbgenerated()) @id
  name         String
  clientId     String             @unique
  clientSecret String
  redirectUri  String
  scopes       Json               @default("[]")
  createdAt    DateTime
  updatedAt    DateTime           @updatedAt
  grants       Json               @default("[]")
  accessTokens OauthAccessToken[]
}

model User {
  id                String             @default(dbgenerated()) @id
  name              String
  email             String             @unique
  encryptedPassword String
  createdAt         DateTime
  updatedAt         DateTime           @updatedAt
  accessTokens      OauthAccessToken[]
}
```

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

[oauth2-server]: https://github.com/oauthjs/node-oauth2-server
