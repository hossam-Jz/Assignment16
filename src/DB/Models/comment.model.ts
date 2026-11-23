import { Types, Schema, model, Model, HydratedDocument } from "mongoose";

export interface Icomment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  parentId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const commentSchema = new Schema<Icomment>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 5000,
      required: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "comment" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

commentSchema.index({ postId: 1, createdBy: -1 });
//compound index
export const CommentModel: Model<Icomment> = model<Icomment>(
  "comment",
  commentSchema,
);

export type HCommentDocument = HydratedDocument<Icomment>;
