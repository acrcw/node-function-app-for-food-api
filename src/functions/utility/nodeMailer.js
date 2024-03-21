const nodemailer = require("nodemailer");
module.exports.sendMail = async function sendMail(str, data) {
   let transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:"joban3360@gmail.com",
        pass:"gmozrelnobadicye"
    }
   })
   var Osubject,Otext,Ohtml;
   if(str=="signup")
   {
    Osubject=`Thanks for Signing up for Cloud Kitchen ${data.name}`;
    Ohtml=`<h1> Welcome to CloudKicthen <h1><br>
    Hope you have a good time!<br>
    This mail has been sent to ${data.email}<br>
    Here are your details :<br>
    Name: ${data.name}<br>
    Email: ${data.email}<br>`

   }
   else if(str=="resetpassword")
   {
        Osubject=`Reset Password`;
        Ohtml=`<h1>Cloud Kitchen</h1><br>
        <hr><br>
        Here is your password Reset Link!
        ${data.resetPasswordLink}`
   }
   const info = await transporter.sendMail({
    from: '"Auto Responder 👻" <joban3360@gmail.com>', // sender address
    to: data.email, // list of receivers
    subject: Osubject, // Subject line
    text: "Hello world?", // plain text body
    html: Ohtml, // html body
  });

  console.log("Message sent: %s", info.messageId);
}