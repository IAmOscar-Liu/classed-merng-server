import { AuthenticationError } from "apollo-server";
import jwt from "jsonwebtoken";
import ContextType from '../contextType';

const checkAuth = ({ req }: ContextType) => {
  const authHeader = req.headers.authorization as string;
  if (authHeader) {
    const token = authHeader.split(`Bearer `)[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY as string);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]'");
  }
  throw new Error("Authorization header must be provided");
};

export default checkAuth;
