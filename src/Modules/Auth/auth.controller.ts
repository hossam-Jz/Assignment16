import AuthService from "./auth.service";
import * as validators from "./auth.validation";
import { validation } from "../../Middlewares/Validation.middleware";

import { Router } from "express";
import { authentication } from "../../Middlewares/authenticaction.middleware";
import { tokenTypeEnum } from "../../Utils/Enums/User.Enum";

const router = Router();

router.post("/signup", validation(validators.signUpSchema), AuthService.signUp);

router.patch(
  "/confirm-email",
  validation(validators.confirmEmailSchema),
  AuthService.confirmEmail,
);
router.post("/login", validation(validators.loginSchema), AuthService.login);
router.patch(
  "/forget-Password",
  validation(validators.ForgetPasswordSchema),
  AuthService.forgetPassword,
);
router.patch(
  "/reset-Password",
  validation(validators.resetPasswordSchema),
  AuthService.resetPassword,
);
router.post(
  "/social-login",
  validation(validators.socialLoginSchema),
  AuthService.socialLogin,
);
router.post(
  "/logout",
  authentication({
    tokenType: tokenTypeEnum.ACCESS,
  }),
  AuthService.logout,
);
export default router;
