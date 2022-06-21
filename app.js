//importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./dbconnect');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

//creating main server and port
const app = express();
const port = 3000;

//use body-parser to extract data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//allow static html files to be formatted with css
app.use(express.static(__dirname));

//session setup to store login info
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    resave: false,
}));
app.use(cookieParser());
var session;
var order = [];
var cartCount = 0;
var subtotal = 0;

/* HTTP Requests */

app.get('/', (req,res)=>{
    res.redirect('/home');
})

//homepage
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/home.html'));
});

//login
app.route('/login') 
    //login
    .get((req, res) => {
        session = req.session;
        if (session.userid){
            res.redirect('/home');
        } else {
         res.sendFile(path.join(__dirname + '/html/login.html'));
        }
    })
    .put((req,res)=>{
        let {username,password} = req.body;
        let id;
        let admin = false;

        //see if username is in database
        db.query('SELECT * FROM users WHERE username=$1', [username], (error, results) => {
            if (error) {
                throw error;
            }

            //no username found
            if (results.rowCount == 0) {

                res.status(200).send("Invalid username");

            } else {

                //password matches -- login success
                if (results.rows[0]['password'] == password) {

                    id = results.rows[0]['id'];
                    admin = results.rows[0]['admin'];
                    session = req.session;
                    session.userid = id;
                    session.username = username;
                    session.admin = admin;

                    res.status(200).send("Success");

                } else {
                    //password doesn't match
                    res.status(200).send("Invalid password");
                }
            }
        })
        //if user was found, update logged in status
        if (id) {
            db.query('UPDATE users SET loggedin=true WHERE id=$1', [id], (err, result) => {
                if (err) {
                    throw err;
                }
            });
        } 
    });


//signup
app.route('/signup')
    .get((req, res) => {
        res.sendFile(path.join(__dirname + '/html/registration.html'));
    })
    .post((req,res)=>{

        //unpack form info
        let { first, last, email, username, password } = req.body;

        //make sure user is not already in database
        db.query('SELECT * FROM users WHERE username=$1', [username], (error, results) => {
            if (error) {
                throw error;
            }

            //new user
            if (results.rowCount == 0) {
                db.query("SELECT id FROM users ORDER BY id DESC", (error, results) => {
                    if (error) {
                        throw error;
                    }

                    //insert new user into database and keep track of session
                    let insertNewUser = 'INSERT INTO users (first, last, email, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING id';
                    let userInfo = [first, last, email, username, password];
                    db.query(insertNewUser, userInfo, (err, result) => {
                        if (err) {
                            throw err;
                        }
                        session = req.session;
                        session.userid = results.rows[0].id;
                        session.username = username;
                        session.admin = false;

                        res.status(200).send("Success");
                    });
                })
            } else {
                //username already taken
                if(results.rows[0]['password'] != password){

                    res.status(200).send("Username taken. Please choose another.");

                } else {
                    //returning user -- login
                    res.status(200).send("You already have an account. Please sign in.");
                }
            }
        });
    })

app.get('/loginstatus',(req,res)=>{
    if(req.session.userid){
        res.send("loggedIn");
    } else {
        res.send("not");
    }
})

app.get('/currentProducts',(req,res)=>{
    res.sendFile(path.join(__dirname + '/html/currentProducts.html'));
})

//cart
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/cart.html'));
});

//add an item to current order
app.post('/addItem', (req,res)=>{

    let newItem = req.body;
    cartCount++;
    let updated = false;
    order.forEach((item)=>{
        if(item.dessert == newItem.dessert){
            item.quantity++;
            item.total += newItem.price;
            subtotal += newItem.price;
            updated = true;
        }
    })
    if (!updated) {
        order.push({"quantity":1, "dessert":newItem.dessert, "size":newItem.size, "price":newItem.price, "total":newItem.price, "image":newItem.image});
        subtotal += newItem.price;
    }
    res.json(cartCount);
})

//get cart count to show on cart badge
app.get('/getCartCount', (req,res)=>{
    res.json(cartCount);
})

//get current order list
app.get('/getCart', (req,res)=>{
    res.send(JSON.stringify(order));
})

//update quantity of items in order
app.put('/editCart',(req,res)=>{
    let {operation, index} = req.body;
    if(operation == 1){
        //increase
        cartCount++;
        order[index]['quantity']++;
        order[index]['total'] += order[index]['price'];
        subtotal += order[index]['price'];
        order[index]['subtotal'] = subtotal;
    } else if (operation == -1){
        //decrease
        if(order[index]['quantity']>0){
            cartCount--;
            order[index]['quantity']--;
            order[index]['total'] -= order[index]['price'];
            subtotal -= order[index]['price'];
        }
        order[index]['subtotal'] = subtotal;
    } else if (operation == 0) {
        cartCount -= order[index]['quantity'];
        subtotal -= order[index]['total'];
        order.splice(index, 1);
    }
    res.status(200).send(order[index]); 
})

//"checkout" i.e. put order in database and empty cart
app.post('/checkout', (req, res) => {

    if(req.session.userid){

        db.query("SELECT id FROM orders ORDER BY id DESC", (error, results) => {
            if (error) {
                throw error;
            }

            let orderid = parseInt(results.rows[0].id) + 1;

            if (order.length == 0) {
                res.send("Empty");
            } else {
                let containsItems = false;

                //insert order into database - each item added separately but connected by order id
                order.forEach((item)=>{
                    if(item.quantity > 0){
                        containsItems = true;
                        let date = new Date();
                        let insertNewOrder = 'INSERT INTO orders (id, userid, dessert, quantity, price, date) VALUES ($1, $2, $3, $4, $5, $6)';
                        let orderInfo = [orderid, session.userid, item.dessert, item.quantity, item.total, date.toLocaleDateString()];
                        db.query(insertNewOrder, orderInfo, (err, result) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                })
                //connect order to user
                if (containsItems) {
                    db.query('UPDATE users SET orders = array_append(orders,$1) WHERE id=$2', [orderid, session.userid], (err, result) => {
                        if (err) {
                            throw err;
                        }
                    });
                    res.send("Success");
                } else {
                    res.send("Cancel");
                }
                //order checked out -- ready for new order
                order = [];
                cartCount=0;
            }
        });
    } else {
        res.send("Login");
    }
});

//log out -- end session
app.get('/logout', (req,res)=>{
    db.query('UPDATE users SET loggedin=false WHERE id = $1', [req.session.userid], (err, result) => {
        if (err) {
            throw err;
        }
    });
    req.session.destroy();
    session = {};
    order = [];
    cartCount=0;
    subtotal=0;
    
    res.redirect('/');
});

//view account info
app.get('/account', (req,res)=>{
    if(req.session.userid){

        if(req.session.admin){

            res.sendFile(path.join(__dirname + '/html/adminaccount.html'));

        } else {
            res.sendFile(path.join(__dirname + '/html/useraccount.html'));
        }
    } else {
        res.redirect('/login');
    }  
})

//displays user info
app.get('/userInfo', (req,res)=>{
    db.query("SELECT * FROM users WHERE id=$1", [session.userid], (err,results)=>{
        if(err){
            throw err;
        }
        res.send(JSON.stringify(results.rows[0]));
    })
})

//displays user info
app.get('/userInfoByName/:username', (req, res) => {
    let username = req.params.username;
    db.query("SELECT * FROM users WHERE username=$1", [username], (err, results) => {
        if (err) {
            throw err;
        }
        if(results.rowCount > 0){
            if(results.rows[0]['id'] != req.session.userid) {
                res.send(JSON.stringify(results.rows[0]));
            } else {
                res.end();
            }  
        }
        res.end();
    })
})

//send info about admin status
app.get('/adminstatus', (req,res)=>{
    res.send(JSON.stringify(session));
})

//updates user info in database
app.put('/editAccount', (req,res) => {

    //iterates through form data and builds a list of items that need to be updated
    let updateList = [];
    for(field in req.body){
        if(req.body[field] != ""){
            updateList.push(field + "=" + "'" + req.body[field] + "'");
        }
    }

    if(updateList.length != 0){

        //some information was updated so need to update the database
        let list = updateList.join();
        let queryReq = `UPDATE users SET ${list} WHERE id=${session.userid}`; 

        db.query(queryReq, (error, results) => {
            if(error){
                throw error;
            }
        })
    }
    //refreshes profile info displayed on page
    res.end();
})

//sends to order history page
app.get('/orderHistory', (req, res) => {
    if(req.session.userid){
        if(req.session.admin){
            res.sendFile(path.join(__dirname + '/html/adminorderhistory.html'));
        }
        else {
            res.sendFile(path.join(__dirname + '/html/orderhistory.html'));
        }
    } 
})

//sends order history for current user
app.get('/getOrderHistory', (req,res) => {

    //use session info - query orders with userid
    db.query("SELECT * FROM orders WHERE userid = $1 ORDER BY id DESC", [session.userid], (error, results)=> {
        if(error){
            throw error;
        }
        let orders = results.rows;
        res.send(JSON.stringify(orders));
    })
})

//sends order history for user matching id
app.get('/getOrderHistory/:id', (req, res) => {

    let userid = req.params.id;

    //use session info - query orders with userid
    db.query("SELECT * FROM orders WHERE userid = $1 ORDER BY id DESC", [userid], (error, results) => {
        if (error) {
            throw error;
        }
        let orders = results.rows;
        res.send(JSON.stringify(orders));
    })
})

//sends to admin page displaying all users
app.get('/users', (req,res)=>{
    if(session.admin) {
        res.sendFile(path.join(__dirname + '/html/allUsers.html'));
    } else {
        res.status(401).send("You do not have access to this page.");
    }
    
})

//sends aray of all users in database
app.get('/allUsers', (req, res)=>{
    //query all users
    db.query("SELECT * FROM users ORDER BY first ASC", (error, results) => {
        if(error){
            throw error;
        }

        res.send(JSON.stringify(results.rows));
    })
})

app.route('/addUser')
    .get((req, res) => {
        res.sendFile(path.join(__dirname + '/html/addUser.html'));
    })
    .post((req, res) => {

        //unpack form info
        let { first, last, email, username, password, admin} = req.body;

        //make sure user is not already in database
        db.query('SELECT * FROM users WHERE username=$1', [username], (error, results) => {
            if (error) {
                throw error;
            }

            //new user
            if (results.rowCount == 0) {
                db.query("SELECT id FROM users ORDER BY id DESC", (error, results) => {
                    if (error) {
                        throw error;
                    }
                    //unique id
                    let id = parseInt(results.rows[0].id) + 1;

                    let insertNewUser;
                    let userInfo;
                    if(admin){
                        insertNewUser = 'INSERT INTO users (id, first, last, email, username, password, admin) VALUES ($1, $2, $3, $4, $5, $6, $7)';
                        userInfo = [id, first, last, email, username, password, admin];
                    } else {
                        insertNewUser = 'INSERT INTO users (id, first, last, email, username, password) VALUES ($1, $2, $3, $4, $5, $6)';
                        userInfo = [id, first, last, email, username, password];
                    }
                    //insert new user into database and keep track of session
                    db.query(insertNewUser, userInfo, (err, result) => {
                        if (err) {
                            throw err;
                        }
                        res.redirect('/users');
                    });
                })
            } else { //username already used
                res.redirect('/addUser');
            }
        });
    })


app.delete('/removeUser/:id', (req,res)=>{
    let id = req.params.id;
    db.query("DELETE FROM users WHERE id=$1",[id],(error,results)=>{
        if(error){
            throw error;
        }
        res.send("Deleted");
    });
});

app.get('/inventory',(req,res)=>{
    res.sendFile(path.join(__dirname + '/html/Inventory.html'));
});

app.get('/getInventory', (req,res)=>{
    //query db for all products -- order by type
    db.query("SELECT * FROM Inventory ORDER BY type", (error,results)=>{
        if(error){
            throw error;
        }

        res.send(JSON.stringify(results.rows));
    });
});

app.route('/addInventory')
    .get((req, res) => {
        res.sendFile(path.join(__dirname + '/html/addInventory.html'));
    })
    .post((req,res)=>{
        //unpack form info
        let { type, name, size, price, image } = req.body;

        if(image == ""){
            image = 'ImageNotFound.svg';
        }

        db.query("SELECT id FROM inventory ORDER BY id DESC", (error, results) => {
            if (error) {
                throw error;
            }

            //unique id
            let id = parseInt(results.rows[0].id) + 1;

            let insertNewItem;
            let itemInfo;
            insertNewItem = 'INSERT INTO inventory (id, type, name, size, price, image) VALUES ($1, $2, $3, $4, $5, $6)';
            itemInfo = [id, type, name, size, price, image];

            //insert new item into database
            db.query(insertNewItem, itemInfo, (err, result) => {
                if (err) {
                    throw err;
                }
                res.redirect('/inventory');
            });
        })
    })

app.delete('/removeItem/:id', (req, res) => {
    let id = req.params.id;
    db.query("DELETE FROM inventory WHERE id=$1", [id], (error, results) => {
        if (error) {
            throw error;
        }
        res.send("Deleted");
    });
});

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});