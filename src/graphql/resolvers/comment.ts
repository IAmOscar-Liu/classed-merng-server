import { AuthenticationError, UserInputError } from "apollo-server";
import checkAuth from "../../utils/check-auth";
import Post from "../../models/Post";
import ContextType from "../../contextType";

export default {
  Mutation: {
    createComment: async (
      _: any,
      {
        postId,
        body,
      }: {
        postId: string;
        body: string;
      },
      context: ContextType
    ) => {
      const { username }: any = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not empty",
          },
        });
      }

      const post: any = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
    async deleteComment(
      _: any,
      { postId, commentId }: { postId: string; commentId: string },
      context: ContextType
    ) {
      //console.log("postId", postId);
      //console.log("comentId", commentId);
      const { username }: any = checkAuth(context);

      const post: any = await Post.findById(postId);
      // console.log("Post: ", post);

      if (post) {
        const commentIndex = post.comments.findIndex(
          (c: any) => c.id === commentId
        );

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
