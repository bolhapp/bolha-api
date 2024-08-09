import Joi from "joi";

export const emailValidator = Joi.string().required().email();

export const passwordValidator = Joi.string()
  .required()
  .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,255}$/);
