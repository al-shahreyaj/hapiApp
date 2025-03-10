const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { createUserSchema, loginUserSchema } = require("../validations/userValidation")

module.exports = [
  {
    method: "POST",
    path: "/register",
    handler: async (request, h) => {
      try {
        const { error, value } = createUserSchema.validate(request.payload);
        if (error) {
          return h.response({ error: error.details[0].message }).code(400);
        }
        value.password = await bcrypt.hash(value.password, 10);
        const user = await User.create(value);
        return h.response(user).code(201);
      } catch (err) {
        return h.response({ error: err.message }).code(400);
      }
    },
    options: { auth: false },
  },
  {
    method: "POST",
    path: "/login",
    handler: async (request, h) => {
      const { error, value } = loginUserSchema.validate(request.payload);
      if (error) {
        return h.response({ error: error.details[0].message }).code(400);
      }
      const user = await User.findOne({ where: { email: value.email } });
      if (!user || !(await bcrypt.compare(value.password, user.password))) {
        return h.response({ error: "Invalid credentials" }).code(401);
      }
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return h.response({ token });
    },
    options: { auth: false },
  },
];