package com.campuscoders.backend.auth.passwordreset;

final class PasswordResetMailTemplates {

  private PasswordResetMailTemplates() {
  }

  static String plainText(String resetLink) {
    return """
        Campus Coders

        Reset your password

        Someone requested a new password for this Campus Coders account.
        This link expires in 15 minutes and can be used once.

        Set a new password:
        %s

        If you did not request this, you can ignore this email. Your password stays the same.
        """.formatted(resetLink);
  }

  static String html(String resetLink) {
    String safeLink = escape(resetLink);
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="margin:0;padding:0;background:#F4EFE4;font-family:Georgia,'Times New Roman',serif;">
          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#F4EFE4;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%%;background:#FFFEFB;border:1px solid #E6D9B8;border-radius:16px;">
                  <tr>
                    <td style="height:6px;background:#C9A227;border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:32px 36px 8px;font-family:Arial,Helvetica,sans-serif;">
                      <p style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#8C701B;font-weight:700;">Campus Coders</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 36px 0;font-family:Georgia,'Times New Roman',serif;">
                      <h1 style="margin:0;font-size:28px;line-height:1.25;color:#1A1A1A;">Reset your password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 36px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#4A453C;">
                      Someone asked to reset the password for this account. Use the button below. The link expires in 15 minutes and works once.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 36px;">
                      <a href="%s" style="display:inline-block;background:#1A1A1A;color:#F4EFE4;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;">
                        Set new password
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#7A7368;">
                      If the button does not work, paste this into your browser:<br>
                      <a href="%s" style="color:#8C701B;word-break:break-all;">%s</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 36px 32px;border-top:1px solid #E6D9B8;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#9A9286;">
                      If you did not request a reset, ignore this email. Your password will not change.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """.formatted(safeLink, safeLink, safeLink);
  }

  static String escape(String value) {
    if (value == null) {
      return "";
    }
    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");
  }
}
