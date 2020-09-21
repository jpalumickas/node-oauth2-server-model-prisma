import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default ({ prisma }) => {
  // Access Tokens

  const getAccessToken = async (token) => {
    const accessToken = await prisma.oauthAccessToken.findOne({
      where: { token },
    });
    return accessToken;
  };

  const getRefreshToken = async (refreshToken) => {
    const token = await prisma.oauthAccessToken.findOne({
      where: { refreshToken },
    });
    if (!token) return;

    return {
      token: token.token,
      refreshToken: token.refreshToken,
      client: {
        id: token.applicationId,
      },
      user: {
        id: token.userId,
      },
    };
  };

  const saveToken = async (token, client, user) => {
    const scopes =
      token.scope && (Array.isArray(token.scope) ? token.scope : [token.scope]);

    await prisma.oauthAccessToken.create({
      data: {
        application: { connect: { id: client.id } },
        user: { connect: { id: user.id } },
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
      include: { user: true },
    });
    if (!accessGrant) return false;

    if (
      accessGrant.expiresAt &&
      Date.parse(accessGrant.expiresAt) >= Date.now()
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
        user: { connect: { id: user.id } },
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
    const user = await prisma.user.findOne({ where: { email: username } });
    if (!user) return;

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

  const getUserWithFacebook = async ({ email, id: facebookId, ...rest }) => {
    console.log({ email, ...rest });
    // TODO: Find by facebook id

    const user = await prisma.user.findOne({ where: { email } });
    if (!user) return;

    // TODO: Create user

    return user;
  };

  const getUserWithGoogle = async ({ email, id: facebookId, ...rest }) => {
    console.log({ email, ...rest });
    // TODO: Find by facebook id

    const user = await prisma.user.findOne({ where: { email } });
    if (!user) return;

    // TODO: Create user

    return user;
  };

  const getUserWithApple = async ({ email, ...rest }) => {
    console.log({ email, ...rest });
    // TODO: Find by facebook id

    const user = await prisma.user.findOne({ where: { email } });
    if (!user) return;

    // TODO: Create user

    return user;
  };

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

    getUserWithFacebook,
    getUserWithGoogle,
    getUserWithApple,
  };
};
