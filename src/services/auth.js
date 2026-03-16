import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export const signIn = (email, password) =>
  new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: (userAttributes) => {
        // Return a special object so the UI can prompt for new password
        reject({ code: "NewPasswordRequired", user, userAttributes });
      },
    });
  });

export const completeNewPassword = (cognitoUser, newPassword) =>
  new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: resolve,
      onFailure: reject,
    });
  });

export const signOut = () => {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
};

export const getCurrentSession = () =>
  new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) return reject(new Error("No current user"));

    user.getSession((err, session) => {
      if (err) return reject(err);
      if (!session.isValid()) return reject(new Error("Session invalid"));
      resolve(session);
    });
  });

export const getIdToken = async () => {
  const session = await getCurrentSession();
  return session.getIdToken().getJwtToken();
};

export const getUserGroups = async () => {
  const session = await getCurrentSession();
  const payload = session.getIdToken().decodePayload();
  return payload["cognito:groups"] || [];
};

export const isAdmin = async () => {
  const groups = await getUserGroups();
  return groups.includes("Admin");
};
