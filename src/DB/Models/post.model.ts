import { HydratedDocument, Model, Schema, Types, model } from "mongoose";

export interface IPost {
  _id: Types.ObjectId;
  content?: string;
  attachments?: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  freezedAt?: Date;
  updatedAt?: Date;
  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];
}

export const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 5000,

      required: function (this: IPost) {
        return !this.attachments?.length;
      },
    },
    attachments: [{ type: String }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    freezedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

postSchema.index({ createdBy: 1, createdAt: -1 });

export const postModel: Model<IPost> = model<IPost>("Post", postSchema);
export type HpostDocument = HydratedDocument<IPost>;

// index  بيساعد قاعدة البيانات إنها توصل للبيانات المطلوبة بشكل أسرع في الاستعلامات المناسبة
// model بيحول schema ل model  عشان نقدر نستخدمه في الاستعلامات
// Model هو عبارة عن class بيحتوي على مجموعة من الدوال اللي بتتعامل مع قاعدة البيانات زي find, create, update, delete
// Schema هو عبارة عن class بيحتوي على تعريفات الحقول والأنواع والقيود الخاصة بالبيانات
// hydratedDocument هو عبارة عن class بيحتوي على البيانات المسترجعة من قاعدة البيانات مع الدوال الخاصة بالdocument زي save, remove, populate
