import { HydratedDocument, Model } from "mongoose";
import { Schema, Types,model} from "mongoose";

export interface IFriendsRequest {
  _id: Types.ObjectId;
  sendBy: Types.ObjectId;
  sendTo: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const friendsRequestSchema = new Schema<IFriendsRequest>({
  sendBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sendTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

friendsRequestSchema.index({ sendBy: 1, sendTo: 1 }, { unique: true });

export const friendsRequestModel:Model<IFriendsRequest> = model<IFriendsRequest>("FriendsRequest", friendsRequestSchema);

export type HfreindsRequestDocument = HydratedDocument<IFriendsRequest>;