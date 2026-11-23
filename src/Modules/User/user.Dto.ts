import {z} from "zod";
import { userIdParamsSchema,requestIdParamsSchema } from "./user.validation";


        export type IUserIdParamsDto = z.infer<typeof userIdParamsSchema.params>;
        export type IRequestIdParamsDto = z.infer<typeof requestIdParamsSchema.params>;