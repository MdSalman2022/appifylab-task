import bcrypt from "bcryptjs";

process.env.DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  "test-only-dummy-password",
  4,
);
