const Joi = require('@hapi/joi');

const createLeaveSchema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().greater(Joi.ref('from')).required(),
  type: Joi.string().valid('Sick', 'Casual', 'Annual', 'Unpaid').required(),
  reason: Joi.string().max(500).required(),
  emergencyContact: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
});

const updateLeaveSchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().greater(Joi.ref('from')).optional(),
  type: Joi.string().valid('Sick', 'Casual', 'Annual', 'Unpaid').optional(),
  reason: Joi.string().max(500).optional(),
  emergencyContact: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).optional(),
}).min(1);

module.exports = {
  createLeaveSchema,
  updateLeaveSchema,
};
