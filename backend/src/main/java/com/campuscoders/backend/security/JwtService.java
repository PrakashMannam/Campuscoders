package com.campuscoders.backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

  // Development secret for signing tokens. Move this to configuration before production.
  private static final String SECRET_KEY = "campus-coders-secret-key-campus-coders-secret-key";

  public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", user.getRole().name());

    return Jwts.builder()
        .claims(claims)
        .subject(user.getEmail())
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
        .signWith(getSigningKey())
        .compact();
  }

  public String extractEmail(String token) {
    String email = extractAllClaims(token).getSubject();

    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token subject");
    }

    return email;
  }

  public boolean validateToken(String token, User user) {
    String email = extractEmail(token);
    return email.equals(user.getEmail()) && !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    Date expiration = extractAllClaims(token).getExpiration();

    if (expiration == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token expiration");
    }

    return expiration;
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
  }
}