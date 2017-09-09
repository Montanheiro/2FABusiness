module.exports = (app) => {
    const controller = app.controllers.UserController;
    const JWTPolicy = require('../lib/jwtVerify.js');

    app.get('/user/get', JWTPolicy, controller.get);
    app.post('/user/edit', JWTPolicy, controller.edit);
    app.post('/user/changePassword', JWTPolicy, controller.changePassword);
    app.post('/user/fieldVerify', controller.uniqueFieldVerify);
}