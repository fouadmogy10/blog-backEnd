const nodemailer = require("nodemailer");
module.exports=async(userEmail,subject,htmlTemplate)=>{
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            secure: true,
            auth: {
              // TODO: replace `user` and `pass` values from <https://forwardemail.net>
              user: process.env.SENDER_EMAIL,
              pass: process.env.APP_EMAIL_PASS,
            },
          });
          const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL, // sender address
            to: userEmail, // list of receivers
            subject: subject, // Subject line
            html: htmlTemplate, // html body
          });
        
    } catch (error) {
        console.log(error);
        throw new Error("Internal server Error (nodeMailer)")
    }
}