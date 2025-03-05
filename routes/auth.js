const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = [
  {
    method: "POST",
    path: "/register",
    handler: async (request, h) => {
      const { firstName, lastName, email, password, role, managerId } = request.payload;
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        const user = await User.create({ firstName, lastName, email, password: hashedPassword, role, managerId });
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
      const { email, password } = request.payload;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return h.response({ error: "Invalid credentials" }).code(401);
      }
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return h.response({ token });
    },
    options: { auth: false },
  },
];