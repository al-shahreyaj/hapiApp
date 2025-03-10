const Joi = require('@hapi/joi');

const createUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(), 
  designation: Joi.string().optional(),
  dateOfBirth: Joi.date().iso().optional(),
  role: Joi.string().valid("developer", "manager", "hr").required(),
  managerId: Joi.number().integer().allow(null), 
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { createUserSchema, loginUserSchema };
