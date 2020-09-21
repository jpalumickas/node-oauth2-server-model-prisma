import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default ({ prisma }) => {
  const getAccessToken = async (token) => {
    return await prisma.oauthAccessToken.findOne({ where: { token } });
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

  const revokeToken = async ({ token }) => {
    const accessToken = await prisma.oauthAccessToken.findOne({
      where: { token },
    });
    if (!accessToken) return false;

    return await prisma.oauthAccessToken.delete({
      where: { id: accessToken.id },
    });
  };

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

  const saveToken = async (token, client, user) => {
    await prisma.oauthAccessToken.create({
      data: {
        application: { connect: { id: client.id } },
        user: { connect: { id: user.id } },
        token: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.accessTokenExpiresAt,
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

  const validateScope = async (user, client, scope) => {
    if (!client.scopes.length) return client.scopes;
    if (!client.scopes.includes(scope)) return false;

    return client.scopes;
  };

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
    getAccessToken,
    getRefreshToken,
    revokeToken,
    getClient,
    getUser,
    saveToken,
    validateScope,
    getUserWithFacebook,
    getUserWithGoogle,
    getUserWithApple,
  };
};
