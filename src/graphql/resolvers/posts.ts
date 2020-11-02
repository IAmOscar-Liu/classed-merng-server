import Post from "../../models/Post";
import ContextType from "../../contextType";
import checkAuth from "../../utils/check-auth";
import { AuthenticationError, UserInputError } from "apollo-server";

export default {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },
    async getPost(_: any, { postId }: { postId: string }) {
      try {
        const post: any = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_: any, { body }: { body: string }, context: ContextType) {
      const user: any = checkAuth(context);

      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post: any = await newPost.save();

      context.pubSub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },
    async deletePost(
      _: any,
      { postId }: { postId: string },
      context: ContextType
    ) {
      const user: any = checkAuth(context);

      try {
        const post: any = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(
      _: any,
      { postId }: { postId: string },
      context: ContextType
    ) {
      const { username }: any = checkAuth(context);

      const post: any = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like: any) => like.username === username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter(
            (like: any) => like.username !== username
          );
        } else {
          // Not likes, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError("Postt not found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_: any, __: any, { pubSub }: ContextType) =>
        pubSub.asyncIterator("NEW_POST"),
    },
  },
};
