//cart
function loadCart() {

    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        let order = JSON.parse(this.response);
        let subtotal = 0;
        if (order.length > 0) {
            document.getElementById('emptymsg').style = "display:none";
            document.getElementById('cartlist').style = "display:block";

            order.forEach((val, i) => {

                //Create table for orders -- Headings: Product -- Quantity -- Price
                let table = document.getElementById('cartlist');
                let item = table.insertRow();

                //image
                let desc = item.insertCell();
                let image = document.createElement('img');
                image.setAttribute('class','thumbnail');
                image.setAttribute('src',val.image);
                desc.appendChild(image);

                //product
                desc = item.insertCell();
                desc.appendChild(document.createTextNode(val.dessert));

                //Quantity (with adjustment buttons)
                let decrease = document.createElement('button');;
                decrease.setAttribute('class', 'adjustbtn');
                decrease.setAttribute('onclick', `decrease(${i})`);
                decrease.innerHTML = "-";

                let increase = document.createElement('button');;
                increase.setAttribute('class', 'adjustbtn');
                increase.setAttribute('onclick', `increase(${i})`);
                increase.innerHTML = "+";

                desc = item.insertCell();
                desc.appendChild(decrease);
                let text = document.createElement('span');
                text.setAttribute('id', `q${i}`);
                text.innerHTML = val.quantity + ` x (${val.size})`;
                desc.appendChild(text);
                desc.appendChild(increase);

                //Price
                desc = item.insertCell();
                text = document.createElement('span');
                text.setAttribute('id', `p${i}`);
                text.innerHTML = `$${val.total}`;
                desc.appendChild(text);
                subtotal += val.total;

                //delete item button
                desc = item.insertCell();
                let deleteButton = document.createElement('button');
                deleteButton.setAttribute('class', 'adjustbtn');
                deleteButton.setAttribute('onclick', `removeItemFromCart(${i})`);
                deleteButton.innerHTML = "Delete";
                desc.appendChild(deleteButton);
            })
            document.getElementById('total').innerHTML = `Total: $${subtotal}`;
        }
    }
    xhttp.open("GET", "/getCart");
    xhttp.send();
}

function increase(i) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.status == 200) {
            //request will send back new quantity and price
            let updatedItem = JSON.parse(this.response);
            document.getElementById(`q${i}`).innerHTML = updatedItem.quantity + ` x (${updatedItem.size})`;
            document.getElementById(`p${i}`).innerHTML = `$${updatedItem.total}`;
            document.getElementById('total').innerHTML = `Total: $${updatedItem.subtotal}`;
        }
    }
    xhttp.open("PUT", '/editCart');
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "operation": 1, "index": i }));
}

function decrease(i) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.status == 200) {
            //request will send back new quantity and price
            let updatedItem = JSON.parse(this.response);
            document.getElementById(`q${i}`).innerHTML = updatedItem.quantity + ` x (${updatedItem.size})`;
            document.getElementById(`p${i}`).innerHTML = `$${updatedItem.total}`;
            document.getElementById('total').innerHTML = `Total: $${updatedItem.subtotal}`;

        }
    }
    xhttp.open("PUT", '/editCart');
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "operation": -1, "index": i }));
}

function removeItemFromCart(i) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function (){
        location.href = '/cart';
    }
    xhttp.open("PUT", '/editCart');
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "operation": 0, "index": i }));
}

function checkout() {

    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        let checkoutmsg = document.getElementById('checkoutmsg');
        if (this.responseText == "Success") {
            checkoutmsg.setAttribute('class', 'success');
            checkoutmsg.innerHTML = "Checkout successful.";
            document.getElementById('cartlist').innerHTML = "";
            document.getElementById('emptymsg').setAttribute('style', 'display:block');
            document.getElementById('total').innerHTML = "Total: $0";

        } else if (this.responseText == "Cancel") {
            checkoutmsg.setAttribute('class', 'failure');
            checkoutmsg.innerHTML = "No items selected. Cannot checkout.";
            document.getElementById('cartlist').innerHTML = "";
            document.getElementById('emptymsg').setAttribute('style', 'display:block');
            document.getElementById('total').innerHTML = "Total: $0";

        } else if (this.responseText == "Login") {
            checkoutmsg.setAttribute('class', 'failure');
            checkoutmsg.innerHTML = "You are not logged in. Cannot checkout.";

        } else {
            checkoutmsg.setAttribute('class', 'failure');
            checkoutmsg.innerHTML = "Your cart is empty. Cannot checkout.";
        }
    }
    xhttp.open("POST", "/checkout");
    xhttp.send();
}