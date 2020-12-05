const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const myPort = 1113; // ** CHANGE PORT **
const fs = require('fs');
const mail = require('./mail');
const AD = require('ad');

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);
const myIv = iv.toString('hex');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Nodemailer
// const transporter = require('./transport');
const to_ = [{"email":"vishal.chhodwani1992@gmail.com"}];
const subject_ = 'New Password Test Emails';


app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));



app.get("/create-user", function (req, res) {
    var f = loadCreateUserForm();
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.end(f);
});

// render form
app.get("/change-password", function (req, res) {

    var userName = req.query.user ? req.query.user : "";
    var f = loadFormTemplate(userName);
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

function loadFormTemplate(userName) {
    try {  
        var file = fs.readFileSync('./views/form_template.html', 'utf8');
        file = file.replace('##USERNAME##', userName);
        return file;
     } catch(e) {
         console.log('Error:', e.stack);
     }
 }

 app.get("/create-test-user", function(req, res) {
     
    try {
        const ad = new AD({
            url: "ldap://10.0.0.4",
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
        });
        
    } catch (error) {
        console.log("error==", error);
    }

    res.status(200).json({ "status": 200, "msg": "Test User created successfully" });

 })
    
app.post("/change-password-success", function (req, res) {
     
    var currentPassword = req.body.currentPassword ? req.body.currentPassword : "";
    var newPassword = req.body.newPassword ? req.body.newPassword : "";
    var confirmPassword = req.body.confirmPassword ? req.body.confirmPassword : "";
    var userName = req.query.user ? req.query.user : "";

    var decryptUserName = decrypt(userName);
    
    changePasswordInAd(currentPassword, newPassword, confirmPassword, decryptUserName);

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
     try{
        var file = fs.readFileSync('./views/result_template.html', 'utf8');
         return file;
     } catch(e) {
         console.log('Error:', e.stack);
     }
 }

 
app.get("/", function(req, res){

    res.redirect("/create-user");
});

app.post("/createUserOnAD", function(req, res){
    
    var firstName = req.body.firstNameInput ? req.body.firstNameInput : '' ;
    var lastName = req.body.lastNameInput ? req.body.lastNameInput : '' ;
    var displayName = req.body.displayNameInput ? req.body.displayNameInput : '' ;
    var location = req.body.locationInput ? req.body.locationInput : '' ;
    var personalEmail = req.body.personalEmailInput ? req.body.personalEmailInput : '' ;
    var manager = req.body.managerInput ? req.body.managerInput : '' ;
    var managerEmail = req.body.managerEmailInput ? req.body.managerEmailInput : '' ;

    let password = generateRandomPassword();
    var personalEmailEncrypted = encrypt(personalEmail);

    var subject = "Welcome to persistent family, "+firstName
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
<pre>Hi ${firstName},
congratulations!! your account is successfully created,
Login password: <b>${password}</b>
You can change your password: <a href="http://localhost:1113/change-password/?user=${personalEmailEncrypted}">Reset Password</a>
Login to pprtal: <button style="background-color: #FF5733;color: white;" onclick="window.location.href = 'https://persistentsystems.sharepoint.com/sites/Pi/SitePages/Pi-Home.aspx';">Login</button>
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
    sendCreateUserEmail(personalEmail, managerEmail, subject, email_txt, email_html);
    createUserOnAD(firstName, lastName, displayName, location, personalEmail, manager, managerEmail, password);

    res.redirect("/create-user");
    // res.status(200).json({ "status": 200, "msg": "User created successfully", "password":password });
  });
  
app.get("/getRandomPassword", function(req, res){
    let password = generateRandomPassword()
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

function createUserOnAD(firstName, lastName, displayName, location, personalEmail, manager, managerEmail, password){

    try {
        const ad = new AD({
            url: "ldap://10.0.0.4",
            user: "tanisha@demo.com",
            pass: "Tanisha123456"
        });
         
        var toSendData = {
            "userName": personalEmail,
            "firstName": firstName,
            "lastName": lastName,
            "displayName": displayName,
            "workLocation": location,
            "personalEmail": personalEmail,
            "manager": manager,
            "managerEmail": managerEmail,
            "password": password
        }
        
        
        ad.user(toSendData).add().then(users => {
            console.log('User created success:', users);
        }).catch(err => {
            console.log('User created failed:', err);
        });
        
    } catch (error) {
        console.log("error==", error);
    }
}
  
function changePasswordInAd(currentPassword, newPassword, confirmPassword, userName){
    
    const ad = new AD({
        url: "ldap://10.0.0.4",
        user: "tanisha@demo.com",
        pass: "Tanisha123456"
    });

    ad.user(userName).changePassword(newPassword)
    .then((data) => {
        console.log('changePasswordInAd==', data);
    })
    .catch((err) => {
        console.log('changePasswordInAd:err==', err);
    });
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

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString('hex');
   }

function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(myIv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(text, 'hex')), decipher.final()]);

    return decrpyted.toString();
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
