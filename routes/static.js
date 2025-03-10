module.exports = [
  {
    method: 'GET',
    path: '/static/{param*}',
    options: {
        auth: false,
        handler: {
            directory: {
                path: "public",
                index: ["index.html"]
            }
        }
    }
  }
];