let cookieSession = require('cookie-session')
let express = require('express');
let app = module.exports = express()

app.use(cookieSession({
    secret: 'rahasia'
}))

const count = (req, res) => {
    req.session.count = (req.session.count || 0) + 1
    res.send('viewed ' + req.session.count + ' times\n')
}

app.use(count)

if (!module.parent) {
    app.listen(3000)
    console.log('Express started on port 3000')
}
