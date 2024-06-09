import Joi from 'joi';
import { CreateUserSchema, LoginSchema } from '../../src/types/types.js';


export const createUserSchema = {
    body: Joi.object<CreateUserSchema>().keys({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
    })
}

export const loginSchema = {
    body: Joi.object<LoginSchema>().keys({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
}
