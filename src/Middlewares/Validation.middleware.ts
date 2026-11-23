import type { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../Utils/Response/Error.Response";
//ZodType: نوع بيمثل Schema من Zod.
type KeyReqType = keyof Request;
/*
KeyReqType : نوع بيمثل مفاتيح Request زي body, query, params, headers, cookies.
*/

type SchemaType = Partial<Record<KeyReqType, ZodType>>;
/** 
  Partial: نوع بيمثل كائن ممكن يحتوي على بعض أو كل المفاتيح من النوع المحدد.
  Record<KeyReqType, ZodType>: نوع بيمثل كائن يحتوي على مفاتيح من KeyReqType وقيم من ZodType.
 */

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ValidationErrors: Array<{
      Key: KeyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];
    for (const Key of Object.keys(schema) as KeyReqType[]) {
      const KeySchema = schema[Key];
      if (!KeySchema) continue;

      const ValidationResults = KeySchema.safeParse(req[Key]);
      if (!ValidationResults.success) {
        ValidationErrors.push({
          Key,
          issues: ValidationResults.error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        });
      }
    }

    if (ValidationErrors.length > 0) {
      throw new BadRequestException("Validation Errors", {
        cause: ValidationErrors,
      });
    }

    next();
  };
};

/**
 * [
  {
    Key: "body",
    issues: [
      {
        message: "Invalid email address",
        path: ["email"]
      }
    ]
  }
]
 */