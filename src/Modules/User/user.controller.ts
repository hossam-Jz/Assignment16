// Modules/User/user.controller.ts
import { Router } from "express";
import UserService from "./user.servce";
import {
  authentication,
  authorization,
} from "../../Middlewares/authenticaction.middleware";
import * as validators from "./user.validation";
import { validation } from "../../Middlewares/Validation.middleware";
import { RoleEnum, tokenTypeEnum } from "../../Utils/Enums/User.Enum";

const router = Router();

router.use(authentication({ tokenType: tokenTypeEnum.ACCESS }));
router.post(
  "/profile",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRole: [RoleEnum.USER, RoleEnum.ADMIN] }),
  UserService.getProfile,
);

router.post(
  "/friend-Request/:userId",
  validation(validators.userIdParamsSchema),
  UserService.sendFriendRequest,
);
router.get("/friend-Requests", UserService.listFriendRequests);
router.patch(
  "/friend-Request/:requestId/accept",
  validation(validators.requestIdParamsSchema),
  UserService.acceptFriendRequest,
);
router.delete(
  "/friend-Request/:requestId/reject",
  validation(validators.requestIdParamsSchema),
  UserService.rejectFriendRequest,
);
router.delete(
  "/friend/:userId",
  validation(validators.userIdParamsSchema),
  UserService.removeFriend,
);
router.patch(
  "/block/:userId",
  validation(validators.userIdParamsSchema),
  UserService.blockUser,
);
router.patch(
  "/unblock/:userId",
  validation(validators.userIdParamsSchema),
  UserService.unblock,
);

export default router;
