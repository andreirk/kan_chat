exports.get = function (req, res, next) {

    res.render('chat', {
        user: req.user
    });
};
