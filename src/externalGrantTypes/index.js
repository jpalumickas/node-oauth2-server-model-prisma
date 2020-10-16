const externalGrantTypes = ({ prisma, userModelName, createUser }) => {
  const userIdentityModelName = `${userModelName}Identity`

  const getUserByIdentity = async ({ provider, uid }) => {
    if (!provider || !uid) return;

    const result = await prisma[userModelName].findMany({
      where: { identities: { some: { uid, provider } } },
      take: 1,
    });

    const user = result[0];

    return user;
  };

  const saveUserIdentity = async ({ user, provider, uid, name, email }) => {
    return await prisma[userIdentityModelName].create({
      [userModelName]: { connect: { id: user.id } },
      provider,
      uid,
      name,
      email,
    })
  }

  const getUserByProvider = async ({ provider, uid, name, email, tokenData }) => {
    const userFromProvider = await getUserByIdentity({
      provider,
      uid,
    });
    if (userFromProvider) return userFromProvider;

    const userByEmail = await prisma[userByEmail].findOne({ where: { email } });

    if (userByEmail) {
      await saveUserIdentity({
        provider,
        uid,
        name,
        email,
      });

      return userByEmail;
    }

    const user = await createUser({
      email,
      name,
      provider: {
        uid,
        name,
        tokenData,
      }
    });

    return user;
  }

  const getUserWithFacebook = async (tokenData) => {
    const { first_name, last_name, email, id: uid  } = tokenData;
    const name = [first_name, last_name].join(' ').trim()

    const user = await getUserByProvider({
      provider: 'facebook',
      uid,
      name,
      email,
      tokenData,
    });

    return user;
  };

  const getUserWithGoogle = async (tokenData) => {
    const { name, email, sub: uid  } = tokenData;

    const user = await getUserByProvider({
      provider: 'google',
      uid,
      name,
      email,
      tokenData,
    });

    return user;
  };

  const getUserWithApple = async (tokenData) => {
    const { name, email, sub: uid  } = tokenData;

    const user = await getUserByProvider({
      provider: 'google',
      uid,
      name, // Only available on first time login
      email,
      tokenData,
    });

    return user;
  };

  return {
    getUserWithFacebook,
    getUserWithGoogle,
    getUserWithApple,
  }
}

export default externalGrantTypes;
