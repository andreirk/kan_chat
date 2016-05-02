var User = require('./models/user').User;
 var http = require('http');
var user = new User({
    username: "Tester2",
    password: "secret"
});

user.save(function (err,user, affected) {
    if (err) throw err;
    console.log(arguments);

    User.findOne({username:"Tester"},function (err, tester) {
        console.log(tester);
    })

});