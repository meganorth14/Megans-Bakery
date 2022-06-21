//products and add to cart
function loadProducts() {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            let products = JSON.parse(this.response);

            if (products.length > 0) {

                products.forEach((item) => {
                    displayProducts(item);
                });
            }
        }
    }
    xhttp.open('GET', '/getInventory');
    xhttp.send();
}

function displayProducts(item) {

    let section = document.getElementById('currentproducts');

    let galleryBlock = document.createElement('div');
    galleryBlock.setAttribute('class', 'gallery');

    //insert image tp gallery block
    let image = document.createElement('img');
    let path = "../images/" + item['image'];
    image.setAttribute('src', path);
    galleryBlock.appendChild(image);

    //description
    let description = document.createElement('div');
    description.setAttribute('class', 'desc');

    //item name
    let title = document.createElement('h6');
    title.innerHTML = item['name'];
    description.appendChild(title);

    //size and price
    let cost = document.createElement('p');
    cost.innerHTML = item['size'] + " for $" + item['price'];
    description.appendChild(cost);

    //add to cart button
    let button = document.createElement('button');
    button.setAttribute('class', 'blue');
    button.setAttribute('onclick', `addToCart("${item['name']}", "${item['size']}", ${item['price']}, "${path}")`);
    button.innerHTML = "Add to Cart";
    description.appendChild(button);

    //attach to product section
    galleryBlock.appendChild(description);
    section.appendChild(galleryBlock);
}

function addToCart(name, size, price, path) {

    let item = {
        "dessert": name,
        "size": size,
        "price": Number(price),
        "image":path
    };

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //update cart icon "cartcount"
            document.getElementById('cartcount').innerHTML = this.responseText;
        }
    }
    xhttp.open("POST", "/addItem");
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(item));

}