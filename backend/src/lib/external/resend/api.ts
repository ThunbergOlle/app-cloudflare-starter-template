import { Resend } from 'resend';
import { AuthenticationContext } from '../../../trpc';

export interface SendPasswordResetEmailParams {
  to: string;
  resetToken: string;
}

export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams,
  apiKey: string,
  ctx: AuthenticationContext,
): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(apiKey);

  const resetUrl = `${ctx.env.PASSWORD_RESET_URL}?token=${params.resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'support@aperto-app.com',
      to: params.to,
      subject: 'Reset Your Aperto Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f5f5f5; border-radius: 12px; padding: 40px; margin: 20px 0;">
              <h1 style="color: #000; font-size: 28px; margin-bottom: 20px; text-align: center;">Reset Your Password</h1>

              <p style="font-size: 16px; margin-bottom: 20px;">
                We received a request to reset your password for your Aperto account. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background-color: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #007AFF; word-break: break-all;">
                ${resetUrl}
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                <strong>This link will expire in 1 hour.</strong>
              </p>

              <p style="font-size: 14px; color: #666;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
                Aperto - Discover Monument Stories
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
