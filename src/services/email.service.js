require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger";

  const text = `Hello ${name},

Thank you for your registration.
We are excited to have you on board.

Best regards,
The Backend Ledger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px;">
      
      <h2 style="color: #2563eb;">
        Welcome to Backend Ledger, ${name}! 🎉
      </h2>

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        Thank you for registering with <strong>Backend Ledger</strong>.
        We are excited to have you on board!
      </p>

      <p>
        Your account has been successfully created.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

      <p>
        Best regards,<br>
        <strong>The Backend Ledger Team</strong>
      </p>

    </div>
  `;
    await sendEmail(userEmail,subject,text,html)
}
async function sendTransactionEmail(userEmail, name, toAccount, amount) {
  const subject = "Transaction Successful - Backend Ledger";

  const text = `Hello ${name},

Your transaction was successfully completed.

Transaction Details:
Amount: ₹${amount}
To Account: ${toAccount}

The transaction has been successfully processed.

Best regards,
The Backend Ledger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px;">

      <h2 style="color: #16a34a;">
        Transaction Successful ✅
      </h2>

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        Your transaction has been successfully completed.
      </p>

      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction Details</strong></p>

        <p>
          Amount:
          <strong style="color: #16a34a;">₹${amount}</strong>
        </p>

        <p>
          To Account:
          <strong>${toAccount}</strong>
        </p>
      </div>

      <p>
        The transaction has been successfully processed.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

      <p>
        Best regards,<br>
        <strong>The Backend Ledger Team</strong>
      </p>

    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}


async function sendFailedTransactionEmail(userEmail, name, toAccount, amount) {
  const subject = "Transaction Failed - Backend Ledger";

  const text = `Hello ${name},

Unfortunately, your transaction could not be completed.

Transaction Details:
Amount: ₹${amount}
To Account: ${toAccount}

Please check your account details and try again.

Best regards,
The Backend Ledger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px;">

      <h2 style="color: #dc2626;">
        Transaction Failed ❌
      </h2>

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        Unfortunately, your transaction could not be completed.
      </p>

      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction Details</strong></p>

        <p>
          Amount:
          <strong style="color: #dc2626;">₹${amount}</strong>
        </p>

        <p>
          To Account:
          <strong>${toAccount}</strong>
        </p>

        <p>
          Status:
          <strong style="color: #dc2626;">Failed</strong>
        </p>
      </div>

      <p>
        Please check your account details and try again.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

      <p>
        Best regards,<br>
        <strong>The Backend Ledger Team</strong>
      </p>

    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports ={sendRegistrationEmail} ;