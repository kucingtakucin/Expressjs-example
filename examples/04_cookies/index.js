let express = require('express');
let app = module.exports = express()
let logger = require('morgan')
let cookieParser = require('cookie-parser')

if (process.env.NODE_ENV !== 'test') {
    app.use(logger(':method :url'))
}

app.use(cookieParser('rahasia disini'))
app.use(express.urlencoded({
    extended: false
}))
app.get('/', function (req, res) {
    if (req.cookies.remember) {
        res.send('Remembered :). Click to <a href="/forget">forget</a>!.');
    } else {
        res.send('<form method="post"><p>Check to <label>' +
            '<input type="checkbox" name="remember"/> remember me</label> ' +
            '<input type="submit" value="Submit"/>.</p></form>');
    }
})

app.get('/forget', function (req, res) {
    res.clearCookie('remember')
})

app.post('/', function (req, res) {
    let minute = 60000
    if (req.body.remember) {
        res.cookie('remember', 1, {
            maxAge: minute
        })
    }
    res.redirect('back')
})

if (!module.parent) {
    app.listen(3000)
    console.log('Express started on port 3000');

}
