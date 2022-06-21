//account views
function showProfile() {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            let user = JSON.parse(this.response);

            document.getElementById('first').setAttribute('placeholder', user.first);
            document.getElementById('last').setAttribute('placeholder', user.last);
            document.getElementById('email').setAttribute('placeholder', user.email);
            document.getElementById('username').setAttribute('placeholder', user.username);
            document.getElementById('password').setAttribute('placeholder', user.password);
        }
    }
    xhttp.open("GET", "/userInfo");
    xhttp.send();
}

function goToOrderHistory() {
    location.href = '/orderHistory';
}

function viewOrderHistory() {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {

        let orders = JSON.parse(this.response);
        let orderBlock = document.getElementById('historylist');

        displayOrderHistory(orders, orderBlock, 'h4', 'h5');
    }
    xhttp.open("GET", "/getOrderHistory");
    xhttp.send();
}
/**
 * Will group orders within a div block and append them to given order block
 * @param {[{'id', 'userid', 'dessert', 'quantity', 'price', 'date'}]} orders - array of orders
 * @param {HTMLDivElement} orderHistory - where to place order div blocks
 * @param {string} heading1 - size of order title
 * @param {string} heading2 - size of subtotal
 */
function displayOrderHistory(orders, orderHistory, heading1, heading2) {
    //no orders --> display message
    if (orders.length == 0) {
        let emptymessage = document.createElement('p');
        emptymessage.innerHTML = "No past orders."
        orderHistory.appendChild(emptymessage);

        //iterate through orders -- group items by order id
        //<h2>Order#${id} -- Placed on ${date}
        //<p>${quantity} dozen ${dessert} ........$${price}
        //<p>${quantity} dozen ${dessert} ........$${price}
        //                              <p>Total: $${total}
        //----------------------------------------------
    } else if (orders.length > 0) {
        let total = 0;
        let orderBlock = document.createElement('div');

        orders.forEach((order, i) => {
            if (i == 0) {
                //insert header with date
                let title = document.createElement(heading1);
                title.innerHTML = `Order# ${order['id']} -- Placed on ${order['date']}`;
                orderBlock.appendChild(title);

            } else if (order['id'] != orders[i - 1]['id']) {
                //new order -- total up last order, reset total and add new header
                let subtotal = document.createElement(heading2);
                subtotal.setAttribute('class', 'text-end');
                subtotal.innerHTML = `Total: $${total}`;
                orderBlock.appendChild(subtotal);
                orderHistory.appendChild(orderBlock);

                total = 0;
                orderBlock = document.createElement('div');
                let title = document.createElement(heading1);
                title.innerHTML = `Order# ${order['id']} -- Placed on ${order['date']}`;
                orderBlock.appendChild(title);
            }

            let desc = document.createElement('p');
            desc.setAttribute('class', 'text-end');
            desc.innerHTML = `${order['quantity']} dozen ${order['dessert']} ------  $${order['price']}`;
            orderBlock.appendChild(desc);

            total += Number(order['price']);
        })
        //final subtotal
        let subtotal = document.createElement(heading2);
        subtotal.setAttribute('class', 'text-end');
        subtotal.innerHTML = `Total: $${total}`;
        orderBlock.appendChild(subtotal);
        orderHistory.appendChild(orderBlock);
    }
}

function viewAll() {
    location.href = "/users";
}

function displayUsers() {

    let xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
        //contains array of users
        let users = JSON.parse(this.response);
        let userBlock = document.getElementById('userlist');
        /*
            Example layout
        
            Name: Megan Orth                
                Username: morth                 Password: password
                Email: meganorth14@gmail.com    Account Type: Admin
                Orders >>                       Delete        
        */
        //iterate through users and display info
        users.forEach((user) => {
            //make new div of user info
            let userInfo = document.createElement('div');
            userInfo.setAttribute('class', 'userInfo');

            let name = document.createElement('h5');
            name.innerHTML = `Name: ${user['first']} ${user['last']}`;
            userInfo.appendChild(name);

            let table = document.createElement('table');
            table.setAttribute('class', 'userInfoTable');

            //row 1
            let row = table.insertRow();

            let cell1 = row.insertCell(0);
            cell1.appendChild(document.createTextNode(`Username:  ${user['username']}`));

            let cell2 = row.insertCell(1);
            cell2.appendChild(document.createTextNode(`Password:  ${user['password']}`));

            //row 2
            row = table.insertRow();

            cell1 = row.insertCell(0);
            cell1.appendChild(document.createTextNode(`Email:  ${user['email']}`));

            cell2 = row.insertCell(1);
            let accountType = (user['admin'] ? 'Admin' : 'Basic');
            cell2.appendChild(document.createTextNode(`Account type:  ${accountType}`));

            //row 3
            row = table.insertRow();

            //attach button with link to get order history of user with id when clicked
            cell1 = row.insertCell(0);
            let orderButton = document.createElement('button');
            orderButton.setAttribute('id', `orderButton${user['id']}`);
            orderButton.setAttribute('class', 'orderlink');
            orderButton.setAttribute('onclick', `userOrderHistory(${user['id']})`);
            orderButton.innerHTML = "+ Expand Orders";
            cell1.appendChild(orderButton);

            //button to remove user
            cell2 = row.insertCell(1);
            let deleteButton = document.createElement('button');
            deleteButton.setAttribute('class', 'adjustbtn');
            deleteButton.setAttribute('onclick', `removeUser(${user['id']})`);
            deleteButton.innerHTML = "Delete";
            cell2.appendChild(deleteButton);

            userInfo.appendChild(table);

            //empty div with userid to display orders when called
            let orderBlock = document.createElement('div');
            orderBlock.setAttribute('id', `orderForUser${user['id']}`);
            orderBlock.setAttribute('style', 'display:none');
            userInfo.appendChild(orderBlock);

            userBlock.appendChild(userInfo);
        })
    }

    xhttp.open('GET', "/allUsers");
    xhttp.send();
}

function userOrderHistory(id) {

    let orderHistory = document.getElementById(`orderForUser${id}`);


    if (orderHistory.getAttribute('style') == 'display:none') {

        orderHistory.setAttribute('style', 'display:block');
        document.getElementById(`orderButton${id}`).innerHTML = "- Collapse Orders";

        //send new request to get order from db
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {

            if (this.readyState == 4 && this.status == 200) {

                //create div blocks for each order and append to order block with id "orderForUser{id}"
                let orders = JSON.parse(this.response);

                displayOrderHistory(orders, orderHistory, 'h6', 'p');
                orderHistory.setAttribute('style', 'display:block');
                document.getElementById(`orderButton${id}`).innerHTML = "- Collapse Orders";

            }
        }
        xhttp.open("GET", `/getOrderHistory/${id}`);
        xhttp.send();

    } else {

        orderHistory.setAttribute('style', 'display:none');
        orderHistory.replaceChildren("");
        document.getElementById(`orderButton${id}`).innerHTML = "+ Expand Orders";
    }
}

function addUser() {
    location.href = './addUser';
}

function removeUser(id) {
    let confirmed = confirm(`Are you sure? This action cannot be undone. Click "OK" to continue.`);
    if (confirmed) {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.readyState == 4) {
                location.href = '/users';
            }
        }
        xhttp.open("DELETE", `/removeUser/${id}`);
        xhttp.send();
    }
}

function editInventory() {
    location.href = "/inventory";
}

function loadInventory() {
    /*
        product id |  type   |         name      |  size   | price |         image
                1  | cupcake | Chocolate Cupcake | 1 dozen |  20   | /images/chocolatecupcakes.jpg
    */

    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {

        let products = JSON.parse(this.response);

        let table = document.getElementById('inventorytable');

        //no products to display
        if (products.length == 0) {
            let emptymessage = document.createElement('p');
            emptymessage.innerHTML = "No products available";
            document.getElementById('inventorylist').appendChild(emptymessage);

        } else { //fill in table with product info

            table.setAttribute('style', 'display:block');
            products.forEach((product) => {

                let row = table.insertRow();

                //fill in product information
                for (category in product) {
                    let cell = row.insertCell();
                    cell.appendChild(document.createTextNode(product[category]));
                }

                //delete item button
                let cell = row.insertCell();
                let deleteButton = document.createElement('button');
                deleteButton.setAttribute('class', 'adjustbtn');
                deleteButton.setAttribute('onclick', `removeItem(${product['id']})`);
                deleteButton.innerHTML = "Delete";
                cell.appendChild(deleteButton);
            });
        }
    }
    xhttp.open("GET", "/getInventory");
    xhttp.send();
}

function addInventory() {
    location.href = './addInventory';
}

function removeItem(id) {
    let confirmed = confirm(`Are you sure? This action cannot be undone. Click "OK" to continue.`);
    if (confirmed) {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.readyState == 4) {
                location.href = '/inventory';
            }
        }
        xhttp.open("DELETE", `/removeItem/${id}`);
        xhttp.send();
    }
}