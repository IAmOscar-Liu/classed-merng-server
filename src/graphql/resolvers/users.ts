import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInputError } from "apollo-server";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../../utils/validators";
import User from "../../models/User";

const generateToken = ({
  id,
  email,
  username,
}: {
  id: string;
  email: string;
  username: string;
}) => {
  return jwt.sign(
    {
      id,
      email,
      username,
    },
    process.env.SECRET_KEY as string,
    { expiresIn: "1d" }  
  );
};

export default {
  Mutation: {
    async login(
      _: any,
      { username, password }: { username: string; password: string }
    ) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user: any = await User.findOne({ username });
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }

      const token = generateToken({
        id: user._id as string,
        email: user._doc.email as string,
        username: user._doc.username as string,
      });

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _: any,
      {
        registerInput: { username, email, password, confirmPassword },
      }: {
        registerInput: {
          username: string;
          email: string;
          password: string;
          confirmPassword: string;
        };
      }
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doesn't alread exist
      const user: any = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toString(),
      });

      const res: any = await newUser.save();

      const token = generateToken({
        id: res._id as string,
        email: res._doc.email as string,
        username: res._doc.username as string,
      });

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
