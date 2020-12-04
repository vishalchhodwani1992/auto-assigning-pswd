const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const myPort = 1113; // ** CHANGE PORT **
const fs = require('fs');
const mail = require('./mail');
const AD = require('ad');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Nodemailer
// const transporter = require('./transport');
const to_ = [{"email":"vishal.chhodwani1992@gmail.com"}];
const subject_ = 'New Password Test Emails';


app.use(express.static(__dirname + '/views'));


app.get("/create-user", function (req, res) {
    var f = loadCreateUserForm();
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.end(f);
});

// render form
app.get("/change-password", function (req, res) {
    console.log("Handle request to proxy...");
    var f = loadFormTemplate();
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.end(f);
});


function loadCreateUserForm(){
    try {  
        var file = fs.readFileSync('./views/create_user.html', 'utf8');
        return file;
     } catch(e) {
         console.log('Error:', e.stack);
     }
}

function loadFormTemplate() {
    try {  
        var file = fs.readFileSync('./views/form_template.html', 'utf8');
        return file;
     } catch(e) {
         console.log('Error:', e.stack);
     }
 }

 app.get("/create-test-user", function(req, res) {
     
    try {
        const ad = new AD({
            url: "ldap://40.71.23.192",
            user: "tanisha@demo.com",
            pass: "Tanisha123456"
        });
         
        
        ad.user().add({
            userName: 'test100',
            firstName: 'name100',
            lastName: 'last100',
            password: 'Test@123'
        }).then(users => {
            console.log('User created success:', users);
        }).catch(err => {
            console.log('User created failed:', err);
        });;
        
    } catch (error) {
        console.log("error==", error);
    }

    // ad.user().get().then(users => {
    //     console.log('Your users:', users);
    // }).catch(err => {
    //     console.log('Error getting users:', err);
    // });

    res.status(200).json({ "status": 200, "msg": "Test User created successfully" });

 })
    
app.post("/password-changed-success", function (req, res) {
     
    var data = "<br /><h2>Password change successfully</h2>";
 
    var subject = "Your password has been changed"
    var email_txt = "this is test email only";
    var email_html = data;    
     
    var t = loadResultTemplate();
    // sendChangePasswordEmail(email_txt, email_html, subject);
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

app.post("/createUserOnAD", function(req, res){
    console.log('create-user==', req.body);
    
    var firstNameInput = req.body.firstNameInput ? req.body.firstNameInput : '' ;
    var lastNameInput = req.body.lastNameInput ? req.body.lastNameInput : '' ;
    var displayNameInput = req.body.displayNameInput ? req.body.displayNameInput : '' ;
    var locationInput = req.body.locationInput ? req.body.locationInput : '' ;
    var personalEmailInput = req.body.personalEmailInput ? req.body.personalEmailInput : '' ;
    var managerInput = req.body.managerInput ? req.body.managerInput : '' ;
    var managerEmailInput = req.body.managerEmailInput ? req.body.managerEmailInput : '' ;

    let password = generateRandomPassword();

    var to = "vishal.chhodwani1992@gmail.com";
    var subject = "Welcome to persistent family, "+firstNameInput
    var email_txt = "Your new password is: ";
    // var email_html = "<br />Your new password is: <h2>"+password+"</h2>";    
    var email_html = `<div>
                        <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;">
                        <tr>
                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
                            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;">
                                <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;">
                                    <tr>
                                        <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">
<pre>Hi ${firstNameInput},
congratulations!! your account is successfully created,
Login password: <b>${password}</b>
Login to pi <button style="background-color: #FF5733;color: white;" onclick="window.location.href = 'https://persistentsystems.sharepoint.com/sites/Pi/SitePages/Pi-Home.aspx';">Login</button>
Regards,
Persistent IT Team</p>
</pre>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">
                                            &copy;2020 Persistent Systems
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        </table>       
                    </div>`
    sendCreateUserEmail(personalEmailInput, managerEmailInput, subject, email_txt, email_html);
    sendDataToActiveDirectory(req.body, password);

    res.redirect("/create-user");
    // res.status(200).json({ "status": 200, "msg": "User created successfully", "password":password });
  });
  
app.get("/getRandomPassword", function(req, res){
    let password = generateRandomPassword()
    console.log("Random generated password is =", password)
    res.status(200).json({ "msg": "Password generation successful", "password":password });
  })
  
  function generateRandomPassword(){
    let generatedPassword = Math.random().toString(36).slice(2)
    console.log("Random generated password is====", generatedPassword)
    //To be added: Encryption for password 
    return generatedPassword;
  }


  function sendCreateUserEmail(personalEmailInput, managerEmailAddress, subject, msg_txt, msg_html){
// setup email data with unicode symbols

    to = [{"email":personalEmailInput}, {"email":managerEmailAddress}];
    let mailOptions = {
        from: 'AD Account 👥 <vishal_chhodwani@persistent.com>', // sender address
        to: to, // list of receivers
        subject: subject,
        // text: msg_txt, // plain text body
        html: msg_html // html body
    };

    mail.send(mailOptions)
  }


  
app.post("/sendPasswordChangedEmail", function(req, res){
    let user = req.body
    console.log("Request is =====", req.body)
    console.log("User is ====", user)

    if (!user) {
        res.status(400).json({ "msg": "User not provided" });
    }else{
        let userEmailAddress = user.userEmailAddress;
        let managerEmailAddress = user.managerEmailAddress;
        //sendEmail function call will be here
        res.status(200).json({"msg": "Email has been sent successfully"})
    }
})

function sendEmail(msg_txt, msg_html, schoolname) {
       // SAMPLE URL:  &program=npower&entity=school&entity_name=AAA&dna_release=20180202&flexitag=tst&redirect_url=explorer-cloud
 
    // setup email data with unicode symbols
    let mailOptions = {
        from: 'AD Account 👥 <vishal_chhodwani@persistent.com>', // sender address
        to: to_, // list of receivers
        subject: subject, // Subject line
        text: msg_txt, // plain text body
        html: msg_html // html body
    };

    mail.send(mailOptions)
}

 function sendDataToActiveDirectory(){

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
