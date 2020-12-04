function validateForm() {
    var form = document.forms["userForm"];
    for(var i = 0; i < 7; i++) {
        var element = form[i];
        if(element.value == "") {
            element.style.border = '2px solid rgb(218, 4, 4)';
            alert(element.name + " field cannot be empty");
            return false;
        }
    }
}