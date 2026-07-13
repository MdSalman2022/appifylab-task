import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import type { AuthModel, StoredUser } from "../models/auth-model.js";

export type Authentication = passport.Authenticator;

export function createAuthentication(model: AuthModel): Authentication {
  const dummyPasswordHash = process.env.DUMMY_PASSWORD_HASH;
  if (!dummyPasswordHash) {
    throw new Error("DUMMY_PASSWORD_HASH is required");
  }

  const authentication = new passport.Authenticator();
  authentication.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      async (email, password, done) => {
        try {
          const user = await model.findUserByEmail(email.trim().toLowerCase());
          const isPasswordValid = await bcrypt.compare(
            password,
            user?.passwordHash ?? dummyPasswordHash,
          );
          done(null, user && isPasswordValid ? user : false);
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  return authentication;
}

declare global {
  namespace Express {
    interface User extends StoredUser {}
  }
}
