import { ApolloServer, PubSub } from "apollo-server";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs/typeDefs";

dotenv.config({ path: path.join(__dirname, "../config.env") });

const pubSub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubSub }),
});

mongoose
  .connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB Connected`);
    return server.listen({ port: process.env.PORT as string | 5000 });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => console.error(err));
