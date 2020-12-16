import bcrypt from 'bcrypt';
import crypto from 'crypto';
import externalGrantTypes from './externalGrantTypes';

const oauth2ServerModelPrisma = ({
  prisma,
  userModelName = 'user',
  createUser,
}) => {
  // Access Tokens

  const getAccessToken = async (token) => {
    const accessToken = await prisma.oauthAccessToken.findOne({
      where: { token },
    });

    if (!accessToken) return;

    if (
      accessToken.tokenExpiresAt &&
      Date.parse(accessToken.tokenExpiresAt) <= Date.now()
    ) {
      await revokeToken(accessToken);
      return;
    }

    return accessToken;
  };

  const getRefreshToken = async (refreshToken) => {
    const token = await prisma.oauthAccessToken.findOne({
      where: { refreshToken },
    });

    if (!token) return;

    if (
      token.refreshTokenExpiresAt &&
      Date.parse(token.refreshTokenExpiresAt) <= Date.now()
    ) {
      await revokeToken(token);
      return;
    }

    return {
      token: token.token,
      refreshToken: token.refreshToken,
      client: {
        id: token.applicationId,
      },
      user: {
        id: token[`${userModelName}Id`],
      },
    };
  };

  const saveToken = async (token, client, user) => {
    const scopes =
      token.scope && (Array.isArray(token.scope) ? token.scope : [token.scope]);

    await prisma.oauthAccessToken.create({
      data: {
        application: { connect: { id: client.id } },
        [userModelName]: { connect: { id: user.id } },
        token: token.accessToken,
        refreshToken: token.refreshToken,
        tokenExpiresAt: token.accessTokenExpiresAt,
        createdAt: new Date().toISOString(),
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scopes,
      },
    });

    token.client = {
      id: client.id,
      clientId: client.clientId,
      name: client.name,
    };

    token.user = {
      id: user.id,
      email: user.email,
    };

    return token;
  };

  const revokeToken = async ({ token }) => {
    const accessToken = await prisma.oauthAccessToken.findOne({
      where: { token },
    });
    if (!accessToken) return false;

    return await prisma.oauthAccessToken.delete({
      where: { id: accessToken.id },
    });
  };

  // Authorization Code

  const getAuthorizationCode = async (code) => {
    const accessGrant = await prisma.oauthAccessGrant.findOne({
      where: { token: code.code },
      include: { [userModelName]: true },
    });
    if (!accessGrant) return false;

    if (
      accessGrant.expiresAt &&
      Date.parse(accessGrant.expiresAt) <= Date.now()
    ) {
      await revokeAuthorizationCode(code);
      return false;
    }

    return {
      code: accessGrant.token,
      expiresAt: accessGrant.expiresAt,
      scope: accessGrant.scopes[0],
      client: {
        id: accessGrant.applicationId,
      },
      user: accessGrant.user,
    };
  };

  const saveAuthorizationCode = async (code, client, user) => {
    const scopes =
      code.scope && (Array.isArray(code.scope) ? code.scope : [code.scope]);

    await prisma.oauthAccessGrants.create({
      data: {
        application: { connect: { id: client.id } },
        [userModelName]: { connect: { id: user.id } },
        token: code.authorizationCode,
        expiresAt: code.expiresAt,
        createdAt: new Date().toISOString(),
        redirectUri: code.redirectUri,
      },
    });

    code.client = {
      id: client.id,
      clientId: client.clientId,
      name: client.name,
    };

    code.user = {
      id: user.id,
      email: user.email,
    };

    return code;
  };

  const revokeAuthorizationCode = async ({ code }) => {
    const accessGrant = await prisma.oauthAccessGrant.findOne({
      where: { token: code },
    });
    if (!accessGrant) return false;

    await prisma.oauthAccessGrant.delete({
      where: { id: accessGrant.id },
    });

    return true;
  };

  // General

  const getClient = async (clientId, clientSecret) => {
    const application = await prisma.oauthApplication.findOne({
      where: { clientId },
    });
    if (!application) return;

    if (
      clientSecret &&
      !crypto.timingSafeEqual(application.clientSecret, clientSecret)
    )
      return;

    return application;
  };

  const getUser = async (username, password) => {
    if (!username || !password) return;

    const user = await prisma[userModelName].findOne({ where: { email: username.toLowerCase() } });
    if (!user) return;
    if (!user.encryptedPassword) return;

    const validPassword = await bcrypt.compare(
      password,
      user.encryptedPassword
    );
    if (!validPassword) return;

    return user;
  };

  const validateScope = async (user, client, scope) => {
    if (!client.scopes.length) return client.scopes;
    if (!client.scopes.includes(scope)) return false;

    return client.scopes;
  };

  // External Grant Types


  return {
    getClient,
    getUser,

    getAccessToken,
    getRefreshToken,
    revokeToken,
    saveToken,

    saveAuthorizationCode,
    getAuthorizationCode,
    revokeAuthorizationCode,

    validateScope,

    ...externalGrantTypes({ prisma, userModelName, createUser }),
  };
};

export default oauth2ServerModelPrisma;
