let express = require('express');
let app = module.exports = express()
let users = require('./db')

app.get('/', function (req, res) {
    res.format({
        html: function () {
            res.send('<ul>' + users.map(function (user) {
                return '<li>' + user.name + '</li>';
            }).join('') + '</ul>');
        },

        text: function () {
            res.send(users.map(function (user) {
                return ' - ' + user.name + '\n';
            }).join(''));
        },

        json: function () {
            res.json(users);
        }
    });
})

function format(path) {
    let obj = require('path')
    return function (req, res) {
        res.format(obj)
    }
}

app.get('/users', format('./users'))

if (!module.parent) {
    app.listen(3000)
    console.log("Express started on port 3000")
}
