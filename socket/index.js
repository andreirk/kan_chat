var log = require('../libs/log')(module);
var config = require('../config');
var cookieParser = require('cookie-parser');
var async = require('async');
var cookie = require('cookie');
var sessionStore = require('../libs/sessionStore');
var HttpError = require('../error').HttpError;
var User = require('../models/user').User;
var _ = require('lodash');


function loadSession(sid, callback) {

    // sessionStore callback is not quite async-style!
    log.debug('session loading');
    sessionStore.load(sid, function(err, session) {
        if (arguments.length == 0) {
            // no arguments => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function loadUser(session, callback) {

    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }

    log.debug("retrieving user ", session.user);

    User.findById(session.user, function(err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        log.debug("user findbyId result: " + user);
        callback(null, user);
    });

}

module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');
    io.set('logger', log);

    io.use(function (socket, next) {
        socket.users = [];
        next();
    });

    io.use(function (socket, next) {
        handshake = socket.handshake;
        async.waterfall([
            function(callback) {
                //   log.debug('cookieParser.signedCookie is ' + cookieParser.signedCookie);
                // сделать handshakeData.cookies - объектом с cookie

                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                log.debug('handshake cookies are ' + handshake);
                log.debug('handshake cookies are ' + handshake.cookies);
                var sidCookie = handshake.cookies[config.get('session:key')];
                log.debug('sid cookies are ' + sidCookie);

                var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
                log.debug('sid is ' + sid);
                loadSession(sid, callback);
            },
            function(session, callback) {

                if (!session) {
                    callback(new HttpError(401, "No session"));
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            function(user, callback) {
                if (!user) {
                    callback(new HttpError(403, "Anonymous session may not connect"));
                }

                handshake.user = user;
                console.log('write to handshake user');
                console.log('handshake after user write  = ' + handshake);
                callback(null);
            }

        ], function(err) {
            if (!err) {
                console.log('return true');
                return next();
            }

            if (err instanceof HttpError) {
                console.log('return false');
                return next(err);
            }

            callback(err);
        });

    });

    io.sockets.on('session:reload', function(sid) {
        var clients = io.sockets.clients();

        clients.forEach(function(client) {
            if (client.handshake.session.id != sid) return;

            loadSession(sid, function(err, session) {
                if (err) {
                    client.emit("error", "server error");
                    client.disconnect();
                    return;
                }

                if (!session) {
                    client.emit("logout");
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            });

        });

    });


    io.sockets.on('connection', function(socket) {
        console.log('connection is');
        console.log(socket.handshake);

        var username = socket.handshake.user.get('username');

        console.log('users are : ' + socket.users);

        if(!_.includes(socket.users, username)){
            socket.users.push(username);
            socket.broadcast.emit('join', username);
        }


        socket.on('message', function(text, cb) {
            socket.broadcast.emit('message', username, text);
            cb && cb();
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        });

    });

    return io;
};