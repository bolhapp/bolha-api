import Joi from "joi";

export const emailValidator = Joi.string().required().email();

export const passwordValidator = Joi.string()
  .required()
  .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,255}$/);

/**
 *
 * @param {number} length determines the length of the first part of the token (excluding the -)
 */
export const tokenValidator = (length: number = 33) => {
  return Joi.string()
    .required()
    .min(length + 1)
    .pattern(new RegExp(`^[A-Za-z0-9!@#$%^&*()_+{}[]:;<>,.?~\\/-]${length}-\\d{5,}$`));
};

export const pageValidator = Joi.number().min(0).required();

export const sortOrderValidator = Joi.string().valid("asc", "desc").required();
