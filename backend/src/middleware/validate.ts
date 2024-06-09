import Joi, { ObjectSchema } from "joi";
import { RequireAtLeastOne } from "../../src/types/types.js";
import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

type RequestValidationSchema = RequireAtLeastOne<
    Record<'body' | 'query' | 'params', ObjectSchema>
>;

const validate =
    (schema: RequestValidationSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            const { error } = Joi.object(schema).validate(
                {
                    body: req.body,
                    query: req.query,
                    params: req.params
                },
                { abortEarly: false, stripUnknown: true }
            );
            if (!error) {
                next();
            } else {
                const errors = error?.details.map((err) => ({
                    field: err.path.join(', '),
                    message: err.message
                }));

                res.status(httpStatus.BAD_REQUEST).json({ errors });
            }
        };

export default validate;
