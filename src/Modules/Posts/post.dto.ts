import { z } from "zod";
import { createPostSchema, likePostSchema, updatePostSchema,craeteCommentSchema, commentIdParamstSchema, updateCommentSchema } from "./post.validation";

export type IcreatePostDto = z.infer<typeof createPostSchema.body>;
export type IpostParamsDto = z.infer<typeof likePostSchema.params>;
export type IupdatePostDto = z.infer<typeof updatePostSchema.body>;
export type ICreatecommentDto = z.infer<typeof craeteCommentSchema.body>;
export type IcommenIdParamstDto = z.infer<typeof commentIdParamstSchema.params>;
export type IupdateCommentDto = z.infer<typeof updateCommentSchema.body>;

/**
 * z.infer: بتستخرج TypeScript Type من Zod Schema.

typeof: بتجيب نوع المتغير createPostSchema.body.

<...>: بنمرر الـ Schema اللي عايزين نستخرج منه النوع.

type IcreatePostDto = {
  content?: string;
};
 */

