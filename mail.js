var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fzomato143@gmail.com',
    pass: 'jlhf tscg ovqa dmye'
  }
});


var mailOptions = {
  from: 'fzomato143@gmail.com',
  to: 'sajal1233.be21@chitkara.edu.in',
  subject: 'Hi dear Sajal',
  text: 'offering you job in zomato (delivery boy)'
};

for(var i = 0; i<100;i++){
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});}