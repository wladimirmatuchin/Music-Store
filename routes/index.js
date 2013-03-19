exports.index = function(req, res){
    if (req.session.user) {
        res.redirect('/welcome');

    } else {
        res.render('index', {layout: null});
    }
};

exports.welcome = function(req, res){
    res.locals.user = req.session.user;
    res.render('welcome', {
        welcome: "hello world",
        layout: null});
};
