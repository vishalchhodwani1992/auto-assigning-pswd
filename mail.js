const sgMail = require('@sendgrid/mail');

sgMail.setApiKey("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");

function send(msg) {
    
    sgMail.send(msg).then((response) => {
        console.log('response==', response);
    }, error => {
        if (error.response) {
            console.log("2.error==", error.response.body)
        }
    });
}
exports.send = send;