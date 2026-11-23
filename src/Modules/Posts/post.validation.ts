import { z } from "zod";

export const createPostSchema = {
  body: z.strictObject({
    content: z.string().min(2).max(5000).optional(),
  }),
};

export const likePostSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
};
export const updatePostSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(5000),
  }),
};
export const deletePostSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
};
// comment
export const craeteCommentSchema = {
  params: z.strictObject({
    commentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(5000),
    parentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID")
      .optional(),
  }),
};
export const updateCommentSchema = {
  params: z.strictObject({
    commentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(5000),
  }),
};
export const commentIdParamstSchema = {
  params: z.strictObject({
    commentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
};

// strictObject  عشان نتأكد إن مفيش أي بيانات زيادة غير اللي احنا محددينها في ال schema
