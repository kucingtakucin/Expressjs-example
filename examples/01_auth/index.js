let express = require('express');
let hash = require('pbkdf2-password')();
let path = require('path')
let session = require('express-session')

let app = module.exports = express()

// config
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// middleware
app.use(express.urlencoded({
    extended: false
}))
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'sangat rahasia'
}))

app.use(function (req, res, next) {
    let err = req.session.error;
    let msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
})

// dummy database
let users = {
    arthur: {
        name: 'arthur'
    }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)
hash({
    password: 'rahasia'
}, function (err, pass, salt, hash) {
    if (err) {
        throw err;
    }
    users.arthur.salt = salt;
    users.arthur.hash = hash;
})

const authenticate = (name, pass, fn) => {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    let user = users[name];
    // query the db for the given username
    if (!user) return fn(new Error('cannot find user'));
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash({
        password: pass,
        salt: user.salt
    }, function (err, pass, salt, hash) {
        if (err) return fn(err);
        if (hash === user.hash) return fn(null, user)
        fn(new Error('invalid password'));
    });
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

app.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect('/');
    });
});


app.get('/', function (req, res, next) {
    res.redirect('/login')
})

app.get('/restricted', restrict, function (req, res) {
    res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
})

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function () {
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.name +
                    ' click to <a href="/logout">logout</a>. ' +
                    ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('back');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' +
                ' username and password.' +
                ' (use "arthur" and "rahasia")';
            res.redirect('/login');
        }
    });
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}
