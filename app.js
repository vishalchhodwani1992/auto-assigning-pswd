const express = require("express");
const app = express();
const myPort = 1113; // ** CHANGE PORT **
const fs = require('fs');
const mail = require('./mail');

// Nodemailer
// const transporter = require('./transport');
const to_ = [{"email":"vishal_chhodwani@persistent.com"}, {"email":"vishal.chhodwani1992@gmail.com"}];
const subject_ = 'New Password Test Emails';


app.use(express.static(__dirname + '/views'));

// render form
app.get("/change-password", function (req, res) {
    console.log("Handle request to proxy...");
    var f = loadFormTemplate();
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.end(f);
});

function loadFormTemplate() {
    try {  
        var file = fs.readFileSync('./views/form_template.html', 'utf8');
        return file;
     } catch(e) {
         console.log('Error:', e.stack);
     }
 }

    
app.get("/password-changed-success", function (req, res) {
    //console.dir(req.body);
    //  var newPassword = req.body.newPassword;
     
    var data = "<br /><h2>Password change successfully</h2>";
    
 
    var subject = "Password Changed"
    var email_txt = "this is test email only";
    var email_html = data;    
     
    var t = loadResultTemplate();
    sendEmail(email_txt, email_html, subject);
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.end(t);
});



function loadResultTemplate(data) {
    console.log("Loading template...");
     try{
        var file = fs.readFileSync('./views/result_template.html', 'utf8');
        console.log("File open");  
         return file;
     } catch(e) {
         console.log('Error:', e.stack);
     }
 }

app.get("/getRandomPassword", function(req, res){
    let password = generateRandomPassword()
    console.log("Random generated password is====", password)
    res.status(200).json({ "msg": "Password generation successful", "password":password });
  })
  
  function generateRandomPassword(){
    let generatedPassword = Math.random().toString(36).slice(2)
    //To be added: Encryption for password 
    return generateRandomPassword;
  }

function sendEmail(msg_txt, msg_html, schoolname) {
       // SAMPLE URL:  &program=npower&entity=school&entity_name=AAA&dna_release=20180202&flexitag=tst&redirect_url=explorer-cloud
 
    // setup email data with unicode symbols
    let mailOptions = {
        from: 'AD Account 👥 <vishal_chhodwani@persistent.com>', // sender address
        to: to_, // list of receivers
        subject: subject_ + " " + schoolname, // Subject line
        text: msg_txt, // plain text body
        html: msg_html // html body
    };

    mail.send(mailOptions)
}


// inspect all routes
function inspectRoutes() {
    const routes = app._router.stack
    .filter((middleware) => middleware.route)
    .map((middleware) => `${Object.keys(middleware.route.methods).join(', ')} -> ${middleware.route.path}`)
    console.log(JSON.stringify(routes, null, 4));
}inspectRoutes();



var port = process.env.PORT || myPort;
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
