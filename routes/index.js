const authRoutes = require("./auth");
const leavesRoutes = require("./leaves");
const staticRoutes = require("./static");

module.exports = [
    ...authRoutes,
    ...leavesRoutes,
    ...staticRoutes
];
