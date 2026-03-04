const SibApiV3Sdk = require('sib-api-v3-sdk');

class EmailService {
    constructor() {
        this.client = SibApiV3Sdk.ApiClient.instance;
        this.apiKey = this.client.authentications['api-key'];
        this.apiKey.apiKey = process.env.BREVO_API_KEY || 'YOUR_TEMPORARY_KEY_HERE';
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    async sendWelcomeEmail(toEmail, name, userId, tempPassword, role) {
        console.log(`[EmailService] Sending welcome email to ${toEmail}...`);

        // If API Key is missing, we just log and skip the actual send
        if (!process.env.BREVO_API_KEY) {
            console.warn('[EmailService] BREVO_API_KEY missing - skipping actual send.');
            console.log(`[MOCK EMAIL PAYLOAD]:
                To: ${toEmail}
                Subject: Welcome to St. Xavier's ERP
                Body: Hello ${name}, your ${role} account has been created.
                ID: ${userId}
                Temp Password: ${tempPassword}
                Please change your password on first login.`);
            return { success: true, mocked: true };
        }

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'no-reply@example.com';
        const senderName = process.env.BREVO_SENDER_NAME || "School ERP";
        sendSmtpEmail.subject = "Welcome to St. Xavier's School ERP";
        sendSmtpEmail.htmlContent = `
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2563eb;">Welcome to St. Xavier's, ${name}!</h2>
                    <p>Your institutional account has been created successfully.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p><strong>Your ${role} ID:</strong> ${userId}</p>
                        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                    </div>
                    <p>For security reasons, you will be required to change this password upon your first login.</p>
                    <p>Login here: <a href="http://localhost:5173/login">School ERP Portal</a></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
                </body>
            </html>`;
        sendSmtpEmail.sender = { "name": senderName, "email": senderEmail };
        sendSmtpEmail.to = [{ "email": toEmail, "name": name }];

        try {
            await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true };
        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
            const reason = error?.response?.text || error?.message || 'Unknown Brevo error';
            return { success: false, error: reason };
        }
    }
}

module.exports = new EmailService();
