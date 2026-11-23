// Modules/User/user.service.ts
import { Request, Response } from "express";
import { decrypt } from "../../Utils/Security/encryption";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/Response/Error.Response";
import { successResponses } from "../../Utils/Response/success.Response";
import { IRequestIdParamsDto, IUserIdParamsDto } from "./user.Dto";
import { userModel } from "../../DB/Models/User.Model";
import { friendsRequestModel } from "../../DB/Models/friendsRequest.model";
import { ta } from "zod/locales";

export class UserService {
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw new UnauthorizedException("Invalid token");

    // plain object: applies the schema's toJSON transform (no password / OTP fields)
    const user = req.user.toJSON();
    if (user.phone) user.phone = decrypt(user.phone);

    return successResponses({ res, message: "Welcome", data: { user } });
  };

  sendFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId }: IUserIdParamsDto = req.params as { userId: string }; // الشخص اللي هنبعتله طلب الصداقة
    const senderId = req.user!._id; // الشخص اللي هيبعت طلب الصداقة
    if (userId === senderId.toString())
      throw new UnauthorizedException(
        "You cannot send a friend request to yourself",
      );

    const target = await userModel.findById(userId);
    if (!target) throw new UnauthorizedException("User not found");
    if (
      target.BlockedUsers?.some((id) => id.equals(senderId)) ||
      req.user?.BlockedUsers?.some((id) => id.equals(target._id))
    )
      throw new UnauthorizedException(
        "You cannot send a friend request to this user",
      );
    if (target.friends?.some((id) => id.equals(senderId)))
      throw new UnauthorizedException("You are already friends with this user");

    const existingRequest = await friendsRequestModel.findOne({
      $or: [
        { sendBy: senderId, sendTo: userId },
        { sendBy: userId, sendTo: senderId },
      ],
    });
    if (existingRequest)
      throw new UnauthorizedException("Friend request already exists");
    const friendRequest = await friendsRequestModel.create({
      sendBy: senderId,
      sendTo: userId,
    });
    return res.status(201).json({
      message: "Friend request sent successfully",
      data: { friendRequest },
    });
  };
  listFriendRequests = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const friendRequests = await friendsRequestModel
      .find({ sendTo: req.user!._id })
      .populate("sendBy", "firstName lastName userName email -_id ")
      .lean()
      .sort({ createdAt: -1 });
    return successResponses({
      res,
      message: "Friend requests retrieved successfully",
      data: { friendRequests },
    });
  };
  acceptFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDto = req.params as {
      requestId: string; // طلب الصداقة نفسه،ID
    };
    const friendRequest = await friendsRequestModel.findOne({
      _id: requestId,
      sendTo: req.user!._id,
    });
    if (!friendRequest)
      throw new UnauthorizedException("Friend request not found");

    await Promise.all([
      userModel.updateOne(
        { _id: friendRequest.sendBy },
        { $addToSet: { friends: friendRequest.sendTo } },
      ),
      userModel.updateOne(
        { _id: friendRequest.sendTo },
        { $addToSet: { friends: friendRequest.sendBy } },
      ),
      friendsRequestModel.deleteOne({ _id: requestId }),
    ]);

    return successResponses({
      res,
      message: "Friend request accepted successfully",
      data: { friendRequest },
    });
  };
  rejectFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDto = req.params as {
      requestId: string;
    };
    const friendRequest = await friendsRequestModel.findOneAndDelete({
      _id: requestId,
      $or: [{ sendTo: req.user!._id }, { sendBy: req.user!._id }],
    });
    if (!friendRequest) throw new NotFoundException("friend Request not Found");

    return res.status(200).json({ message: "friend Request rejected" });
  };
  removeFriend = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDto = req.params as { userId: string };
    const myId = req.user!._id;

    await Promise.all([
      userModel.updateOne({ _id: myId }, { $pull: { friends: userId } }),
      userModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
    ]);
    return res.status(200).json({ message: "friend Removed Successfuly" });
  };
  blockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDto = req.params as { userId: string };
    const myId = req.user!._id;
    if (userId === myId.toString())
      throw new BadRequestException("you Cannot block Yourself");
    const target = await userModel.findById(userId);
    if (!target) throw new NotFoundException("user Not Found");

    await Promise.all([
      userModel.updateOne(
        { _id: myId },
        { $addToSet: { BlockedUsers: userId }, $pull: { friends: userId } },
      ),
      userModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
      friendsRequestModel.deleteMany({
        $or: [
          { sendBy: myId, sendTo: userId },
          { sendBy: userId, sendTo: myId },
        ],
      }),
    ]);
    return res.status(200).json({ message: "user Blocked Successfuly" });
  };
  unblock = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDto = req.params as { userId: string };
    const myId = req.user!._id;

    const update = await userModel.updateOne(
      { _id: myId },
      { $pull: { BlockedUsers: userId } },
    );
    if (update.matchedCount === 0)  //لو هدفك تتأكد إن المستخدم الحالي موجود، ممكن تستخدم matchedCount
      throw new BadRequestException("user Not Found or Invalid unblocked user");
    return res.status(200).json({ message: "user unBlocked Successfuly" });
  };
}

export default new UserService();
