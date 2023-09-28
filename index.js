//imports
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const config = require('./config.json');

//constants
const app = express();
const port = 3000;
const saltRounds = 10;

//database connection
const con = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db
});

const loginLim = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
const registerLim = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 100 requests per windowMs
});

app.use('/auth/login/', loginLim);
app.use('/auth/register/', registerLim);

//this function generates a session token for a user that logged in
//input: payload, secret key, expiration time(optional)
//output: token
function generateToken(payload, secretKey, expiresIn = '2h') {
    try 
    {
      // Create the token with the payload, secret key, and optional expiration time
      const token = jwt.sign(payload, secretKey, { expiresIn });
      return token;
    } catch (error) 
    {
      console.error('Error generating token:', error);
      return null;
    }
}

//this function generates a unique 8 digit id for a new user
//input: none
//output: id
function generateUserId()
{
    const min = 10000000; // Minimum 8-digit number
    const max = 99999999; // Maximum 8-digit number
    randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    //checking if id is already in use
    con.query(`SELECT Id FROM accounts WHERE Id = ?`, randomId, (err, result) => {
        if(err) throw err;
        if(result.length == 0) {
            return randomId;
        }
        else
        {
            //if id is already in use, generate a new one (recursion)
            return randomId = generateUserId();
        }
    });

    return randomId;
}

app.get('/auth/register/', (req, res) => {
    //getting paramas from url
    var username = req.query.username;
    var email = req.query.email;
    var password = req.query.password;

    //if username and password are not null
    if(username && password) {
        //check if username is already registered
        con.query(`SELECT * FROM accounts WHERE username = ?`, username, (err, result) => {
            if(err) throw err;
            if(result.length == 0) {
                //username not registered -> hash password -> insert into database
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if(err) throw err;
                    //generate unique id
                    var id = generateUserId();
                    //insert into database
                    con.query('INSERT INTO accounts (Username, Email, Password, Id) VALUES (?, ?, ?, ?)', [username, email, hash, id], (err, result) => {
                        if(err) throw err;
                        console.log('+-+-+-+ User Registered +-+-+-+')
                        console.log(`username: ${username}`);
                        console.log(`email: ${email}`);
                        console.log(`id: ${id}`);
                        console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+')
                        //return success message
                        res.status(200).json({ message: 'user registered' });
                    });
                });
            }
            else
            {
                res.status(409).json({ message: 'username already registered' });
            }
        });
    }
    else
    {
        res.status(422).json({ message: 'invalid username or password' });
    }
});

app.get('/auth/login/', (req, res) => {
    //getting paramas from url
    var username = req.query.username;
    var password = req.query.password;

    //if username and password are not null
    if(username && password) 
    {
        //check username and password
        con.query('SELECT Username, Password, Id FROM accounts WHERE Username = ?', [username], (err, dResult) => {
            if(err) throw err;
            if(dResult.length == 0) {
                res.status(401).json({ token: 'login failed' });
                return;
            }
            bcrypt.compare(password, dResult[0].Password, (err, result) => { //checking hashed password
                if(err) throw err;
                if(result) {
                    //login successful
                    userPayload = { username: username, id: dResult[0].Id};
                    const token = generateToken(userPayload, config.jwtsecret);
                    if(token)
                    {
                        res.status(200).json({ token: token });
                    }
                    else
                    {
                        res.status(401).json({ token: "error generating token" });
                    }
                }
                else
                {
                    res.status(401).json({ token: 'login failed' });
                }
            });
        });
        
    }
    else
    {
        res.status(422).json({ message: 'invalid username or password' });
    }
});

//wrong path (404)
app.get('*', (req, res) => {
    res.status(404).json({ message: 'Path Not Found' });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});