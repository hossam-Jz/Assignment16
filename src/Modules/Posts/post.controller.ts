import { Router } from "express";
import postService from "./post.service";
import * as validators from "./post.validation";
import { authentication } from "../../Middlewares/authenticaction.middleware";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer";
import { validation } from "../../Middlewares/Validation.middleware";
const router = Router();

router.use(authentication());
// Create Post
router.post(
  "/upload-file",
  localFileUpload({ validation: fileValidation.image, folder: "posts" }).array(
    "attachments",
    20,
  ),
  validation(validators.createPostSchema),
  postService.createPost,
);
router.patch(
  "/:postId/like",
  validation(validators.likePostSchema),
  postService.toggleLikePost,
);
router.patch(
  "/:postId/update",
  validation(validators.updatePostSchema),
  postService.updatePost,
);
router.delete(
  "/:postId/delete",
  validation(validators.deletePostSchema),
  postService.deletePost,
);
router.get(
  "/:postId",
  validation(validators.likePostSchema),
  postService.getSpecificPost,
);
router.post(
  "/:postId/craete-comment",
  validation(validators.craeteCommentSchema),
  postService.createComment,
);
router.patch(
  "/update-comment/:commentId",
  validation(validators.updateCommentSchema),
  postService.updateComment,
);
router.delete(
  "/delete-comment/:commentId",
  validation(validators.commentIdParamstSchema),
  postService.deleteComment,
);

export default router;
