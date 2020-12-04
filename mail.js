const sgMail = require('@sendgrid/mail');
var config = require("./config/config.json");
sgMail.setApiKey(config.sendgrid_api_key);

function send(msg) {
    
    sgMail.send(msg).then((response) => {
        // console.log('response==', response);
    }, error => {
        if (error.response) {
            console.log("2.error==", error.response.body)
        }
    });
}
exports.send = send;