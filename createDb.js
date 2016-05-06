var mongoose = require('./libs/mongoose');
mongoose.set('debug',true);
var async = require('async');


async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function (err, results) {
 //   console.log('finish');
    console.dir(arguments);
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback ) {
    mongoose.connection.on('open', callback);

}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('./models/user');

    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    },callback);
}

function createUsers(callback) {
    require('./models/user');
    var users = [
        {username:"Вася", password: 'supervasya'},
        {username:"Вася", password: '123'},
        {username:"admin", password: 'thetruehero'}
    ];

    async.each(users, function(userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);

    // async.parallel([
    //     function (callback) {
    //         var vasya = new User({username:"Вася", password: 'supervasya'});
    //         vasya.save(function (err) {
    //             callback(err,vasya);
    //         });
    //
    //     },
    //     function (callback) {
    //         var petya = new User({username:"Петя", password: '123'});
    //         petya.save(function (err) {
    //             callback(err,petya);
    //         });
    //
    //     },
    //     function (callback) {
    //         var admin = new User({username:"admin", password: 'thetruehero'});
    //         admin.save(function (err) {
    //             callback(err,admin);
    //         });
    //     }
    // ], callback);
}

function close(callback) {
    mongoose.disconnect(callback);
}
