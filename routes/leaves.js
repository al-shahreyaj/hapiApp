const { User, Leave } = require("../models");

module.exports = [
  {
    method: "POST",
    path: "/leaves",
    handler: async (request, h) => {
      const { from, to, type, reason, emergencyContact } = request.payload;
      const userId = request.auth.credentials.id;
      try {
        const leave = await Leave.create({ from, to, type, reason, emergencyContact, userId });
        return h.response(leave).code(201);
      } catch (err) {
        return h.response({ error: err.message }).code(400);
      }
    },
  },
  {
    method: "GET",
    path: "/leaves",
    handler: async (request, h) => {
      const userId = request.auth.credentials.id;
      let leaves;

      if (request.auth.credentials.role === "hr") {
        leaves = await Leave.findAll();
      } else if (request.auth.credentials.role === "manager") {
        const subordinates = await User.findAll({ where: { managerId: userId } });
        const subordinateIds = subordinates.map((user) => user.id);
        leaves = await Leave.findAll({ where: { userId: subordinateIds } });
      } else {
        leaves = await Leave.findAll({ where: { userId } });
      }

      return h.response(leaves);
    },
  },
  {
    method: "GET",
    path: "/leaves/{leaveId}",
    handler: async (request, h) => {
      const { leaveId } = request.params;
      const leave = await Leave.findByPk(leaveId);

      if (!leave) {
        return h.response({ message: "Leave not found" }).code(404);
      }

      if (
        request.auth.credentials.role !== "hr" &&
        request.auth.credentials.role !== "manager" &&
        leave.userId !== request.auth.credentials.id
      ) {
        return h.response({ message: "Unauthorized to view this leave" }).code(403);
      }

      return h.response(leave);
    },
  },
  {
    method: "PUT",
    path: "/leaves/{leaveId}",
    handler: async (request, h) => {
      const { leaveId } = request.params;
      const leave = await Leave.findByPk(leaveId);

      if (!leave) {
        return h.response({ message: "Leave not found" }).code(404);
      }

      const leaveUser = await User.findByPk(leave.userId);

      if (!leaveUser) {
        return h.response({ message: "User with this leave not found" }).code(404);
      }

      if (
        request.auth.credentials.role !== "hr" &&
        leave.userId !== request.auth.credentials.id &&
        leaveUser.managerId !== request.auth.credentials.id
      ) {
        return h.response({ message: "Unauthorized to update this leave" }).code(403);
      }

      await leave.update(request.payload); 
      return h.response(leave);
    },
  },
  {
    method: "DELETE",
    path: "/leaves/{leaveId}",
    handler: async (request, h) => {
      const { leaveId } = request.params;
      const leave = await Leave.findByPk(leaveId);

      if (!leave) {
        return h.response({ message: "Leave not found" }).code(404);
      }

      const leaveUser = await User.findByPk(leave.userId);

      if (!leaveUser) {
        return h.response({ message: "User with this leave not found" }).code(404);
      }

      if (
        request.auth.credentials.role !== "hr" &&
        leave.userId !== request.auth.credentials.id &&
        leaveUser.managerId !== request.auth.credentials.id
      ) {
        return h.response({ message: "Unauthorized to delete this leave" }).code(403);
      }

      await leave.destroy();
      return h.response({ message: "Leave deleted" });
    },
  },
];