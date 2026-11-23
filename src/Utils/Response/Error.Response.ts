
import { NextFunction, Request, Response } from "express";
import { env } from "../../config/config.service";

// Error: class في JavaScript، بنعمل منه instance وجواه message و name و stack

export interface IErrorResponse extends Error{
    statusCode:number;
}
// IErrorResponse جواه كل حاجه تبغ ERR وstatusCode عشان مش عنده
export class ApplicationException extends Error {
    constructor(
        message:string,
        public statusCode: number =400,
        options?:ErrorOptions,
    ){
        super(message, options);
        this.name = this.constructor.name;

    }
}
/**
 * throw new NotFoundException("Invalid otp");   object of class ApplicationException 
 * this.constructor.name  بتجيب اسم الobject
 *  */ 

export class BadRequestException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 400, options);
    }
}

export class UnauthorizedException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 401, options);
    }
}

export class ForbiddenException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 403, options);
    }
}

export class NotFoundException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 404, options);
    }
}
export class ConflictException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,      
    ){
        super(message, 409, options);
    }
};
export class TooManyRequestsException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 429, options);
    }
};

export class InternalServerErrorException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 500, options);
    }
}
export const globalErrorHandler = (
    error: IErrorResponse,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    const statusCode = error.statusCode || 500;
    const IsDev = env.MODE === "DEVELOPMENT";

    if (statusCode >= 500) {
        console.error(error);
    }

    res.status(statusCode).json({
        message: error.message || "Something went wrong",
        ...(IsDev && {
            stack: error.stack,
            cause: error.cause
        })
    });
};
