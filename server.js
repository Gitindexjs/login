const express = require("express");
const app = express();
const fs = require('fs');
// const mongoose = require('mongoose');
// mongoose.connect("mongodb+srv://chris:WsZYZvwrBCX9AR6Z@liablecode-qlj4f.mongodb.net/liablecode?retryWrites=true&w=majority", err => {
//     err ? console.log(err) : console.log('success');
// });
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
const {charset} = require('./charset.json');
let users = []
let createToken = () => {
    let token = "";
    for(let i = 0; i < 15; i++){
        token += charset[Math.floor(Math.random() * charset.length)];
    }
    return token;
}
let genPassword = (rounds) => {
    if(!typeof rounds === "number") throw `Cannot set rounds to ${rounds}`
    let password = "";
    for(let i = 0; i < rounds; i++){
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
}
let currentp = genPassword(10);
let token = createToken();
console.log(`current user ${token} db password is ${currentp}`)
app.use(express.static(__dirname + '/public' ));
app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/index.html");
}); /* a route */
app.get('/home', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.route('/store')
.get((req, res) => {
    res.render(fs.readFile('/shop.ejs'), {
        
    })
})
app.route('/register')
.get((req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
})
.post(async (req, res) =>{
    try{
        if(!(req.body.email || req.body.password)){
            res.status(400).redirect(301, '/login')
        };
        console.log(req.body);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { email: req.body.email, password: hashedPassword };
        users.push(user);
        res.status(201).redirect(301, '/login');
    } catch {
        res.status(500).send();
    }
});
app.post('/users/find', (req, res) => {
    if(req.body.client === token && req.body.password === currentp){
        res.send(users);
    } else {
        res.status(500).send("forbidden");
    }
})
/*
* @example
*/
app.route('/login')
.get((req, res) => {
    res.sendFile(`${__dirname}/public/login.html`)
})
.post(async (req, res) =>{
    const user = users.find(user => user.email = req.body.email);
    if(user == null){
        console.log(users);
        return res.status(400).send('Cannot find user');
    }
    try {
        const bool = await bcrypt.compare(req.body.password, user.password)
        if(bool){
            res.send('Success :)')
        }else{
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});
app.listen(5500);