const externalGrantTypes = ({ prisma, createUser }) => {
  const getUserByIdentity = async ({ provider, uid }) => {
    if (!provider || !uid) return;

    const user = await prisma.user.findMany({
      where: { identities: { some: { uid, provider } } },
      take: 1,
    })[0];
    return user;
  };

  const saveUserIdentity = async ({ user, provider, uid, name, email }) => {
    return await prisma.userIdentity.create({
      user: { connect: { id: user.id } },
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

    const userByEmail = await prisma.user.findOne({ where: { email } });

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
