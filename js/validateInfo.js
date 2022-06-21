//check that user is in database
function validateLogin() {

    //login form element
    const loginForm = document.getElementById('login');

    loginForm.addEventListener('submit', function (event) {

        //don't submit
        event.preventDefault();

        //get error message element
        let errormsg = document.getElementById('loginerror');
        errormsg.innerHTML = "";

        let userInput = {
            username: loginForm.username.value,
            password: loginForm.password.value
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if(this.status == 200 && this.readyState == 4){

                //response message - either success or error
                let message = this.responseText;

                if (message == "Success") {

                    //user recognized -- send to homepage
                    location.href = "/home";

                } else {

                    //error message displayed
                    errormsg.innerHTML = message;
                }
            }
        }
        xhttp.open("PUT", '/login');
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(userInput));
    });
}

function validateSignUp(event) {

    //registration form element
    const regForm = document.getElementById('signup');

    regForm.addEventListener('submit', function (event) {

        event.preventDefault();

        let errormsg = document.getElementById('signuperror');
        //errormsg.innerHTML = "";

        //validate info here

        let userInput = {
            first: regForm.first.value,
            last: regForm.last.value,
            email: regForm.email.value,
            username: regForm.username.value,
            password: regForm.password.value
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.status == 200 && this.readyState == 4) {
                let message = this.responseText;

                if (message == "Success") {

                    //user recognized -- send to homepage
                    location.href = "/home";

                } else {

                    //error message displayed
                    errormsg.innerHTML = message;
                }
            }
        }
        xhttp.open("POST", '/signup');
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(userInput));
    });
}

function validateNewItem(){}

function validateUpdatedInfo(){
    //login form element
    const editAccountForm = document.getElementById('editAccount');

    editAccountForm.addEventListener('submit', function (event) {

        //don't submit
        event.preventDefault();

        //get error message element
        let errormsg = document.getElementById('editaccounterror');
        errormsg.innerHTML = "";

        let userInput = {
            first: editAccountForm.first.value,
            last: editAccountForm.last.value,
            email: editAccountForm.email.value,
            username: editAccountForm.username.value,
            password: editAccountForm.password.value
        };

        //check is username(if updated) is already in use
        if(userInput.username != ""){
            let xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                if (this.status == 200 && this.readyState == 4) {

                    //if a response comes, username is already in system
                    if (this.response) {

                        //error message displayed
                        errormsg.innerHTML = "Username taken. Choose another.";

                    } else {

                        //username not taken -- update user info
                        let xhttp2 = new XMLHttpRequest();
                        xhttp2.open("PUT", '/editAccount');
                        xhttp2.setRequestHeader('Content-type', 'application/json');
                        xhttp2.send(JSON.stringify(userInput));
                        
                        location.href='/account';
                    }
                }
            }
            xhttp.open("GET", `/userInfoByName/${userInput.username}`);
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.send();

        } else {

            //username not changed -- update user info
            let xhttp2 = new XMLHttpRequest();
            xhttp2.open("PUT", '/editAccount');
            xhttp2.setRequestHeader('Content-type', 'application/json');
            xhttp2.send(JSON.stringify(userInput));

            location.href='/account';
        }
    });
}