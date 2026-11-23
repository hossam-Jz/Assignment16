import { Request, Response } from "express";
import {
  IcommenIdParamstDto,
  ICreatecommentDto,
  IcreatePostDto,
  IpostParamsDto,
  IupdateCommentDto,
  IupdatePostDto,
} from "./post.dto";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Response/Error.Response";
import { postModel } from "../../DB/Models/post.model";
import { CommentModel } from "../../DB/Models/comment.model";

class postservice {
  constructor() {}
  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content }: IcreatePostDto = req.body;
    const files = req.files as Express.Multer.File[] | undefined;
    if (!content && (!files || !files.length)) {
      throw new BadRequestException("Content or file is required");
    }
    //.array("attachments", 20) وده معناه إن Multer هيستقبل مجموعة ملفات، ويحطها في:req.files
    const post = await postModel.create({
      ...(content && { content }),
      ...(files?.length && {
        attachments: files.map((file) => {
          if (!file.finalPath) {
            throw new BadRequestException("File path is missing");
          }
          return file.finalPath;
        }),
      }),

      createdBy: req.user!._id,
    });
    return res.status(201).json({
      message: "Post created successfully",
      data: { post },
    });
  };
  getSpecificPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IpostParamsDto = req.params as { postId: string };
    const post = await postModel
      .findOne({
        _id: postId,
        freezedAt: { $exists: false },
      })
      .populate("createdBy", "firstName lastName email")
      .lean();
    if (!post) throw new BadRequestException("Post not found");
    return res.status(200).json({
      message: "Post found",
      data: { post },
    });
  };
  toggleLikePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IpostParamsDto = req.params as { postId: string };
    const userId = req.user!._id;
    const post = await postModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new BadRequestException("Post not found");
    const alreadyLiked = post.likes?.some((id) => id.equals(userId));
    const update = await postModel.findByIdAndUpdate(
      postId,
      alreadyLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
      { new: true },
      //معناها رجّع الـ Document بعد التعديل، مش قبل التعديل.
    );
    return res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      data: { update },
    });
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IpostParamsDto = req.params as { postId: string };
    const { content }: IupdatePostDto = req.body;

    const post = await postModel.findOneAndUpdate(
      { _id: postId, createdBy: req.user!._id, freezedAt: { $exists: false } },

      { content },
      { new: true },
    );
    if (!post)
      throw new BadRequestException("Post not found or not authorized");
    return res.status(200).json({
      message: "Post updated successfully",
      data: { post },
    });
  };
  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IpostParamsDto = req.params as { postId: string };
    const post = await postModel.findOneAndDelete({
      _id: postId,
      createdBy: req.user!._id,
      freezedAt: { $exists: false },
    });
    if (!post)
      throw new BadRequestException("Post not found or not authorized");
    return res.status(200).json({
      message: "Post deleted successfully",
    });
  };
  createComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IpostParamsDto = req.params as { postId: string };
    const { content, parentId }: ICreatecommentDto = req.body;
    const userId = req.user!._id;

    // نتأكد إن الـ Post موجود ومش معمول له freeze
    const post = await postModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    // لو ده Reply، نتأكد إن التعليق الأب موجود على نفس الـ Post
    //parentId: الـ ID بتاع التعليق اللي المستخدم بيرد عليه.
    if (parentId) {
      const parentComment = await CommentModel.findOne({
        _id: parentId,
        postId,
      });

      if (!parentComment) {
        throw new NotFoundException("Parent comment not found");
      }
    }

    // إنشاء التعليق أو الرد
    const comment = await CommentModel.create({
      postId,
      content,
      ...(parentId && { parentId }),
      createdBy: userId,
    });

    return res.status(201).json({
      message: "Comment created successfully",
      data: { comment },
    });
  };
  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: IcommenIdParamstDto = req.params as {
      commentId: string;
    };
    const { content }: IupdateCommentDto = req.body;
    const comment = await CommentModel.findOneAndUpdate(
      {
        _id: commentId,
        createdBy: req.user!._id,
      },
      {
        content,
      },
      { new: true },
    );
    if (!content)
      throw new ForbiddenException("comment Not found Or You Are Not author");

    return res
      .status(200)
      .json({ message: "comment Updtaed Successfuly", data: { comment } });
  };
  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: IcommenIdParamstDto = req.params as {
      commentId: string;
    };
    const userId = req.user!._id;

    const comment = await CommentModel.findById(commentId);
    if (!comment) throw new NotFoundException("comment Not Found");

    const post = await postModel.findById(comment.postId);
    const isCommentAuthor = comment.createdBy.equals(userId);
    const isPostOwner = post?.createdBy.equals(userId);

    if (!isCommentAuthor && !isPostOwner)
      throw new ForbiddenException("you Not authorized to delete comment");

    await Promise.all([
      CommentModel.deleteOne({ _id: commentId }),
      CommentModel.deleteMany({ parentId: commentId }),
    ]);

    return res
      .status(200)
      .json({ message: "comment Deleted Successfuly", data: { comment } });
  };
}
export default new postservice();

/**
 * user!
 * دي Non-null Assertion Operator في TypeScript.
معناها إننا بنقول للمترجم: أنا متأكد إن req.user موجود
 */
