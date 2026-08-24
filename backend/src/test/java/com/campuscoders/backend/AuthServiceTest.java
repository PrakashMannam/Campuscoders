package com.campuscoders.backend;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.auth.AuthResponse;
import com.campuscoders.backend.auth.AuthService;
import com.campuscoders.backend.auth.CurrentUserResponse;
import com.campuscoders.backend.auth.LoginRequest;
import com.campuscoders.backend.auth.RegisterRequest;
import com.campuscoders.backend.auth.dto.ForgotPasswordRequest;
import com.campuscoders.backend.auth.dto.MessageResponse;
import com.campuscoders.backend.auth.dto.ResetPasswordRequest;
import com.campuscoders.backend.auth.emailverification.DisposableEmailGuard;
import com.campuscoders.backend.auth.emailverification.EmailVerificationCodeRepository;
import com.campuscoders.backend.auth.emailverification.EmailVerificationCodeService;
import com.campuscoders.backend.auth.emailverification.EmailVerificationMailService;
import com.campuscoders.backend.auth.passwordreset.PasswordResetMailService;
import com.campuscoders.backend.auth.passwordreset.PasswordResetToken;
import com.campuscoders.backend.auth.passwordreset.PasswordResetTokenRepository;
import com.campuscoders.backend.security.JwtService;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private JwtService jwtService;

  @Mock
  private PasswordResetTokenRepository passwordResetTokenRepository;

  @Mock
  private PasswordResetMailService passwordResetMailService;

  @Mock
  private EmailVerificationCodeRepository emailVerificationCodeRepository;

  @Mock
  private EmailVerificationCodeService emailVerificationCodeService;

  @Mock
  private EmailVerificationMailService emailVerificationMailService;

  @Mock
  private DisposableEmailGuard disposableEmailGuard;

  @InjectMocks
  private AuthService authService;

  @Test
  void register_withoutMail_shouldAutoVerifyAndReturnToken() {
    RegisterRequest request = new RegisterRequest();
    request.setFullName("Prakash");
    request.setEmail("prakash@gmail.com");
    request.setPassword("secret123");

    when(userRepository.existsByEmail("prakash@gmail.com")).thenReturn(false);
    when(passwordEncoder.encode("secret123")).thenReturn("encoded-secret");
    when(emailVerificationMailService.isConfigured()).thenReturn(false);

    User savedUser = new User();
    savedUser.setId(1L);
    savedUser.setFullName("Prakash");
    savedUser.setEmail("prakash@gmail.com");
    savedUser.setPassword("encoded-secret");
    savedUser.setRole(Role.STUDENT);
    savedUser.setEnabled(true);
    savedUser.setEmailVerified(true);

    when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> {
      User u = inv.getArgument(0);
      u.setId(1L);
      return u;
    });
    when(jwtService.generateToken(any(User.class))).thenReturn("mock-jwt-token");

    AuthResponse response = authService.register(request);

    assertNotNull(response);
    assertEquals("mock-jwt-token", response.getToken());
    assertEquals("prakash@gmail.com", response.getEmail());
    assertEquals(Role.STUDENT, response.getRole());
    assertTrue(Boolean.TRUE.equals(response.getEmailVerified()));
  }

  @Test
  void register_withMail_shouldRequireVerificationWithoutToken() {
    RegisterRequest request = new RegisterRequest();
    request.setFullName("Prakash");
    request.setEmail("prakash@gmail.com");
    request.setPassword("secret123");

    when(userRepository.existsByEmail("prakash@gmail.com")).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("encoded");
    when(emailVerificationMailService.isConfigured()).thenReturn(true);
    when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> {
      User u = inv.getArgument(0);
      u.setId(1L);
      return u;
    });
    when(emailVerificationCodeService.issueRawCode(any(User.class))).thenReturn("123456");

    AuthResponse response = authService.register(request);

    assertNull(response.getToken());
    assertTrue(Boolean.TRUE.equals(response.getRequiresEmailVerification()));
    verify(emailVerificationMailService).sendVerificationCode(eq("prakash@gmail.com"), eq("123456"));
  }

  @Test
  void register_duplicateEmail_shouldThrowConflictException() {
    RegisterRequest request = new RegisterRequest();
    request.setEmail("prakash@gmail.com");

    when(userRepository.existsByEmail("prakash@gmail.com")).thenReturn(true);

    assertThrows(ResponseStatusException.class, () -> authService.register(request));
  }

  @Test
  void login_validCredentials_shouldReturnAuthResponse() {
    LoginRequest request = new LoginRequest();
    request.setEmail("prakash@gmail.com");
    request.setPassword("secret123");

    User user = new User();
    user.setId(1L);
    user.setEmail("prakash@gmail.com");
    user.setPassword("encoded-secret");
    user.setEmailVerified(true);

    when(userRepository.findByEmail("prakash@gmail.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("secret123", "encoded-secret")).thenReturn(true);
    when(jwtService.generateToken(user)).thenReturn("mock-jwt-token");

    AuthResponse response = authService.login(request);

    assertNotNull(response);
    assertEquals("mock-jwt-token", response.getToken());
  }

  @Test
  void login_unverified_withMailConfigured_shouldForbid() {
    LoginRequest request = new LoginRequest();
    request.setEmail("prakash@gmail.com");
    request.setPassword("secret123");

    User user = new User();
    user.setEmail("prakash@gmail.com");
    user.setPassword("encoded-secret");
    user.setEmailVerified(false);

    when(userRepository.findByEmail("prakash@gmail.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("secret123", "encoded-secret")).thenReturn(true);
    when(emailVerificationMailService.isConfigured()).thenReturn(true);
    when(emailVerificationCodeService.issueRawCode(user)).thenReturn("654321");

    assertThrows(ResponseStatusException.class, () -> authService.login(request));
    verify(emailVerificationMailService).sendVerificationCode("prakash@gmail.com", "654321");
  }

  @Test
  void login_invalidPassword_shouldThrowUnauthorizedException() {
    LoginRequest request = new LoginRequest();
    request.setEmail("prakash@gmail.com");
    request.setPassword("wrongpass");

    User user = new User();
    user.setPassword("encoded-secret");

    when(userRepository.findByEmail("prakash@gmail.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrongpass", "encoded-secret")).thenReturn(false);

    assertThrows(ResponseStatusException.class, () -> authService.login(request));
  }

  @Test
  void getCurrentUser_userExists_shouldReturnResponse() {
    User user = new User();
    user.setId(1L);
    user.setFullName("Prakash");
    user.setEmail("prakash@gmail.com");
    user.setRole(Role.STUDENT);

    when(userRepository.findByEmail("prakash@gmail.com")).thenReturn(Optional.of(user));

    CurrentUserResponse response = authService.getCurrentUser("prakash@gmail.com");

    assertNotNull(response);
    assertEquals("Prakash", response.getFullName());
    assertEquals("prakash@gmail.com", response.getEmail());
  }

  @Test
  void forgotPassword_userExists_shouldGenerateToken() {
    ForgotPasswordRequest req = new ForgotPasswordRequest("prakash@gmail.com");
    User user = new User();
    user.setId(1L);
    user.setEmail("prakash@gmail.com");

    PasswordResetToken oldToken = new PasswordResetToken();
    oldToken.setUsed(false);

    when(userRepository.findByEmail("prakash@gmail.com")).thenReturn(Optional.of(user));
    when(passwordResetTokenRepository.findByUserIdAndUsedFalse(1L)).thenReturn(List.of(oldToken));

    MessageResponse res = authService.forgotPassword(req);

    assertNotNull(res);
    verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
    verify(passwordResetMailService).sendResetLink(eq("prakash@gmail.com"), anyString());
  }

  @Test
  void forgotPassword_unknownEmail_doesNotSendMail() {
    ForgotPasswordRequest req = new ForgotPasswordRequest("nobody@gmail.com");
    when(userRepository.findByEmail("nobody@gmail.com")).thenReturn(Optional.empty());

    authService.forgotPassword(req);

    verify(passwordResetMailService, never()).sendResetLink(anyString(), anyString());
  }

  @Test
  void resetPassword_validToken_shouldUpdatePassword() {
    ResetPasswordRequest req = new ResetPasswordRequest("valid-token", "newSecret123");

    User user = new User();
    user.setId(1L);
    user.setPassword("old-pass");

    PasswordResetToken token = new PasswordResetToken();
    token.setToken("valid-token");
    token.setUser(user);
    token.setUsed(false);
    token.setExpiresAt(Instant.now().plusSeconds(900));

    when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
    when(passwordEncoder.encode("newSecret123")).thenReturn("encoded-new-pass");

    MessageResponse res = authService.resetPassword(req);

    assertNotNull(res);
    assertEquals("encoded-new-pass", user.getPassword());
    verify(passwordResetTokenRepository).save(token);
  }

  @Test
  void resetPassword_expiredToken_shouldThrowException() {
    ResetPasswordRequest req = new ResetPasswordRequest("expired-token", "newSecret123");

    PasswordResetToken token = new PasswordResetToken();
    token.setToken("expired-token");
    token.setUsed(false);
    token.setExpiresAt(Instant.now().minusSeconds(100));

    when(passwordResetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

    assertThrows(ResponseStatusException.class, () -> authService.resetPassword(req));
  }
}
