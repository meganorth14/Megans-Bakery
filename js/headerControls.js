//header buttons
function loginButtons() {
    let xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            let status = this.response;
            if (status == "loggedIn") {
                //account
                let button = document.getElementById('accountbtn');
                button.setAttribute('onclick', 'goToAccount()');
                button.innerHTML = "Account";

                //logout
                button = document.getElementById('loginstatusbtn');
                button.setAttribute('onclick', 'logout()');
                button.innerHTML = "Logout";

            } else {
                //Sign Up
                let button = document.getElementById('accountbtn');
                button.setAttribute('onclick', 'goToSignUp()');
                button.innerHTML = "Sign Up";

                //login
                button = document.getElementById('loginstatusbtn');
                button.setAttribute('onclick', 'goToLogin()');
                button.innerHTML = "Login";
            }
        }
    }
    xhttp.open("GET", "/loginstatus");
    xhttp.send();
}

function goToCart() {
    location.href = "/cart";
}

function getCartCount(){
    //xhttp request to get current cart count and display under "cartcount" span item
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        //update badge
        let count = parseInt(this.response);

        if(count > 0){
            document.getElementById('cartcount').innerHTML = count;
        }
    }
    xhttp.open("GET","/getCartCount");
    xhttp.send();
}

function goToLogin() {
    location.href = "/login";
}

function goToSignUp() {
    location.href = '/signup';
}

function goToProducts() {
    location.href = '/currentProducts';
}

function goToHome() {
    location.href = '/';
}

function logout() {
    location.href = '/logout';
}

function goToAccount() {

    location.href = '/account';
}