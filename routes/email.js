const express = require('express');
const { Resend } = require('resend');
const Mailchimp = require('@mailchimp/mailchimp_marketing');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// Configure Mailchimp
const mailchimp = Mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX // e.g., 'us1'
});

// Add this function to send email via Mailchimp
async function sendMailchimpEmail(to, subject, htmlContent) {
  try {
    const response = await mailchimp.messages.send({
      message: {
        from_email: process.env.EMAIL_FROM,
        subject: subject,
        html: htmlContent,
        to: [{ email: to }]
      }
    });
    return response;
  } catch (error) {
    console.error('Mailchimp API Error:', error);
    throw error;
  }
}

const SOCIAL_ICONS = {
  facebook: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABZElEQVR4nO2UO0sDQRSFP42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZGBZdnY2+yQB8cJwy9w55947M7uwwn+CBmwBHaALvAKPQBsoi7dKzgPgDfgEboEGUAIOgbEEjIEHYB8oAsfAC/ChWlFy6sA78KyauVjHwANwpvxPJ+dYgDPVvwQOgG3gWv7EzLmQwTFwAGwCl/KdW3LqMrgS4Fy+M0vOlQxuBLiQ78aSU5PBnQAX8h1bckoymArQkO/IklOQwVSApnxrP8mpymAiQEu+VUvOhgwmArTlW7Lk5GUwEeBevkVLTlYGYwG68i1YcjIy+BKgJ9+8JScF9GUwEKAv35wlJwkMZNAXYCBfypKTAAYy6AkwlC9hyYkDQxl0BRjJF7PkhP8HhzLoCDCWb9UWHPkXLDkr/Dl8A7T6bKPvNgzHAAAAAElFTkSuQmCC`,
  twitter: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWklEQVR4nO2UPUsDQRCGH42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZCAsu3u7l/MSEAcGbmfmfXZ25xb+8dfRAA6BLtADXoEnoA2UxVsh5wB4Bz6BW6ABFIFD4E0CxsAjsAcUgRPgBfhQrSg5deAN6KtmLtYJ8AicK//LyTkR4Ez1r4B9YAe4kT8xcy5kcAwcANvAtXznlpy6DK4FuJDv3JJzLYM7AS7lO7fkVGUwFaAp35klpySDqQAt+Y4sOXkZTAVoy7duyVmXwUSAjnxrlpysDMYC3Mu3YslJy2AkQFe+RUtOChjIYChAX745S04SGMpgIMBAvpQlJwEMZdATYChf3JITAwYy6AowlC9myYkCfRl0BBjJt2LJifwPDmTQFmAs36otOPQvWHL+8OX4AhXRbKOTqkNkAAAAAElFTkSuQmCC`,
  instagram: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABjElEQVR4nO2UPUsDQRDHf42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZOAiu7d7l7sEQQcGbmfm/e3s7C78Y9FRA46BHtAHXoEnoANUxFsl5xB4Az6AW6AJFIBD4FUCJsADsA8UgRPgGXhXrSg5DeAV6KtmLtYJ8ACcKf/TyTkR4Ez1r4ADYBO4kT8xcy5kcAwcAFvAtXznlpy6DK4FuJDv3JJzLYM7AS7lO7fkVGUwFaAl35klpySDqQBt+Y4sOXkZTAXoyLduyVmTwUSArnxrlpyMDMYC3Mu3YslJyWAkQE++RUtOEhjKYCRAX745S04CGMpgIMBAvpQlJw4MZdATYChfzJITBQYy6AowlC9qyYn8Dw5k0BZgLN+KLTj0L1hy4sBYBh0BxvKt2oLD/4IlJwaMZNAVYCTfsi049C9YcqLASAZtAUbyrdiCQ/+CJScCjGTQEWAs36otOPQvWHL+8OX4AggXeSM0Y1O0AAAAAElFTkSuQmCC`,
  linkedin: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABZ0lEQVR4nO2UPUsDQRSFP42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZGBZdnY2+yQB8cJwy9w55947M7uwwn+CBmwBHaALvAKPQBsoi7dKzgPgDfgEboEGUAIOgbEEjIEHYB8oAsfAC/ChWlFy6sA78KyauVjHwANwpvxPJ+dYgDPVvwQOgG3gWv7EzLmQwTFwAGwCl/KdW3LqMrgS4Fy+M0vOlQxuBLiQ78ySU5PBnQAX8h1bckoymArQkO/IklOQwVSApnxrP8mpymAiQEu+VUvOhgwmArTlW7Lk5GUwEeBevkVLTlYGYwG68i1YcjIy+BKgJ9+8JScF9GUwEKAv35wlJwkMZNAXYCBfypKTAAYy6AkwlC9hyYkDQxl0BRjJF7PkhP8HhzLoCDCWb9UWHPkXLDkr/Dl8A7T6bKPvNgzHAAAAAElFTkSuQmCC`
};

router.post('/api/send-email', async (req, res) => {
  try {
    const { to, name, quizTitle, quizDate, fees, iban, emailType, quizLink, paymentMethod, paymentStatus } = req.body;

    const logoUrl = 'https://your-domain.com/images/1EuroQuizLogo.jpg'; // Update with your actual logo URL

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quiz Registration</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1d1c1d;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .logo {
              margin-bottom: 32px;
            }
            .logo img {
              height: 40px;
              width: auto;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 24px;
            }
            .code-box {
              background-color: #f8f9fa;
              border-radius: 4px;
              padding: 24px;
              margin: 24px 0;
              text-align: center;
            }
            .quiz-link {
              display: inline-block;
              background-color: #007a5a;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 4px;
              margin: 16px 0;
            }
            .details {
              background-color: #f8f9fa;
              border-radius: 4px;
              padding: 20px;
              margin: 24px 0;
            }
            .social-links {
              display: inline-block;
              margin: 0 8px;
            }
            .social-icon {
              display: inline-block;
              margin: 0 8px;
            }
            .social-icon img {
              width: 24px;
              height: 24px;
              vertical-align: middle;
            }
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 1px solid #e1e1e1;
              font-size: 14px;
              color: #616061;
              text-align: center;
            }
            .footer-links {
              margin: 16px 0;
            }
            .footer-links a {
              color: #616061;
              text-decoration: none;
              margin: 0 12px;
            }
            .footer-links a:hover {
              color: #1264a3;
              text-decoration: underline;
            }
            .company-info {
              margin-top: 16px;
              font-size: 12px;
              color: #868686;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="${logoUrl}" alt="1 Euro Quiz Logo" />
            </div>
            
            <h1>Confirm your quiz registration</h1>
            
            <p>Dear ${name},</p>
            
            <p>Thank you for registering for <strong>${quizTitle}</strong>. Below are your quiz details:</p>
            
            <div class="details">
              <p><strong>Quiz Details:</strong></p>
              <ul>
                <li>Date: ${quizDate}</li>
                <li>Entry Fee: €${fees}</li>
                ${paymentMethod === 'bank' ? `<li>Payment Status: ${paymentStatus}</li>` : ''}
              </ul>
            </div>

            <p>To join the quiz at the scheduled time, click the button below:</p>
            
            <div class="code-box">
              <a href="${quizLink}" class="quiz-link">Join Quiz</a>
            </div>

            ${paymentMethod === 'bank' ? `
            <div class="details">
              <p><strong>Bank Transfer Details:</strong></p>
              <p>Please complete your payment using the following bank details:</p>
              <p>IBAN: ${iban}</p>
            </div>
            ` : ''}

            <p>If you didn't request this registration, you can safely ignore this email.</p>

            <div class="footer">
              <div class="social-links">
                <a href="https://facebook.com/oneeuroquiz" class="social-icon" target="_blank">
                  <img src="${SOCIAL_ICONS.facebook}" alt="Facebook" style="width: 24px; height: 24px;" />
                </a>
                <a href="https://twitter.com/oneeuroquiz" class="social-icon" target="_blank">
                  <img src="${SOCIAL_ICONS.twitter}" alt="Twitter" style="width: 24px; height: 24px;" />
                </a>
                <a href="https://instagram.com/oneeuroquiz" class="social-icon" target="_blank">
                  <img src="${SOCIAL_ICONS.instagram}" alt="Instagram" style="width: 24px; height: 24px;" />
                </a>
                <a href="https://linkedin.com/company/oneeuroquiz" class="social-icon" target="_blank">
                  <img src="${SOCIAL_ICONS.linkedin}" alt="LinkedIn" style="width: 24px; height: 24px;" />
                </a>
              </div>

              <div class="footer-links">
                <a href="https://oneeuroquiz.com/about">About Us</a>
                <a href="https://oneeuroquiz.com/contact">Contact</a>
                <a href="https://oneeuroquiz.com/privacy">Privacy Policy</a>
                <a href="https://oneeuroquiz.com/terms">Terms of Service</a>
              </div>

              <div class="company-info">
                <p>Need help? Contact our support team at support@oneeuroquiz.com</p>
                <p>1 Euro Quiz | Making Learning Fun</p>
                <p>© ${new Date().getFullYear()} One Euro Quiz. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      // Try sending with Resend first
      const resendData = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: 'Quiz Registration Confirmation',
        html: emailContent
      });

      // If Resend fails, try Mailchimp as backup
      if (!resendData) {
        const mailchimpData = await sendMailchimpEmail(
          to,
          'Quiz Registration Confirmation',
          emailContent
        );
        console.log('Email sent via Mailchimp:', mailchimpData);
      } else {
        console.log('Email sent via Resend:', resendData);
      }

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (emailError) {
      console.error('Email Service Error:', emailError);
      res.status(500).json({ 
        error: 'Failed to send email',
        details: emailError.message 
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

module.exports = router; 