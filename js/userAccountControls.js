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