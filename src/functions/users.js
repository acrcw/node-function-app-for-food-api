const { app } = require('@azure/functions');
const { getAllusers, Signup, Login, deleteuser, getuserProfile, updateuser, resetpwd, forgetpassword } = require('./controller/usercontroller');

app.http('getAllusers', {
    route:"users",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getAllusers
});
app.http('signup', {
    route:"signup",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: Signup
});
app.http('login', {
    route:"login",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: Login
});
app.http('delete', {
    route:"delete",
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: deleteuser
});
app.http('getauser', {
    route:"user",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: getuserProfile
});
app.http('updateuser', {
    route:"user",
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: updateuser
});
app.http('updatepassword', {
    route:"updatepassword",
    methods: ['PATCH'],
    authLevel: 'anonymous',
    handler: resetpwd
});
app.http('forgetpassword', {
    route:"forgetpassword",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: forgetpassword
});
