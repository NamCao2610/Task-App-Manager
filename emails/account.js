const sgMail = require('@sendgrid/mail');
const multer = require('multer');

const sendGridAPIKey = process.env.SEND_GRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'namdepzai2610@gmail.com',
        subject: 'Thanks for jonning in!',
        text: `Chao mung ban ${name}  den voi app cua toi hi vong ban se co trai nghiem tuyet voi voi no`
    })
}

const sendByeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'namdepzai2610@gmail.com',
        subject: 'Soory. Hope you come back',
        text: `Goobye ${name}. see you again hen gap lai ban hi vong ban se som tro lai`
    })
}

module.exports = {
    sendWelcomeMail,
    sendByeMail
}