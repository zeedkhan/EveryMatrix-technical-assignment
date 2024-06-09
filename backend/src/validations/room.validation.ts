import Joi from 'joi';
import { CreateRoomSchema } from '../../src/types/types.js';


export const createRoomSchema = {
    body: Joi.object<CreateRoomSchema>().keys({
        name: Joi.string().required(),
        userId: Joi.string().required()
    })
}

export const createMessageSchema = {
    body: Joi.object().keys({
        text: Joi.string().required(),
        type: Joi.string().valid("TEXT", "FILE").required(),
        userId: Joi.string().required(),
        chatRoomId: Joi.string().required()
    })
}

export const updateRoomAvatarSchema = {
    body: Joi.object().keys({
        storePath: Joi.string().required()
    })
}

export const updateRoomSchema = {
    body: Joi.object().keys({
        name: Joi.string().required()
    })
}