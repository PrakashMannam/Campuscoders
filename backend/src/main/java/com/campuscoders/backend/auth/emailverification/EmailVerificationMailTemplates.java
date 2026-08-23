package com.campuscoders.backend.auth.emailverification;

final class EmailVerificationMailTemplates {

  private EmailVerificationMailTemplates() {
  }

  static String plainText(String code) {
    return """
        Campus Coders verification code

        Your code is: %s

        It expires in 10 minutes. If you did not create an account, you can ignore this email.
        """.formatted(code);
  }

  static String html(String code) {
    return """
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0F1115">
          <h2 style="margin:0 0 12px">Verify your email</h2>
          <p style="margin:0 0 16px;color:#5C6570">Enter this code in Campus Coders to finish creating your account.</p>
          <p style="font-size:28px;letter-spacing:6px;font-weight:700;margin:24px 0;color:#0F1115">%s</p>
          <p style="margin:0;color:#5C6570;font-size:14px">Expires in 10 minutes. If you did not sign up, ignore this email.</p>
        </div>
        """.formatted(code);
  }
}
