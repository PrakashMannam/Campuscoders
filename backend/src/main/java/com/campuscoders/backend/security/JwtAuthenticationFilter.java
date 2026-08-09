package com.campuscoders.backend.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final CustomUserDetailsService userDetailsService;

  public JwtAuthenticationFilter(
      JwtService jwtService,
      UserRepository userRepository,
      CustomUserDetailsService userDetailsService) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.userDetailsService = userDetailsService;
  }

  // Intercepts every HTTP request once to extract and validate the JWT Bearer token from headers.
  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    // 1️⃣ Requests without a "Bearer " header proceed unauthenticated (permitting public endpoints like /register or /login).
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    // 2️⃣ Strip "Bearer " prefix (7 characters) to extract raw JWT string.
    String token = authHeader.substring(7);
    String email = jwtService.extractEmail(token);

    // 3️⃣ If token contains a subject and SecurityContext isn't authenticated yet for this thread:
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      User user = userRepository.findByEmail(email).orElse(null);

      // 4️⃣ Verify signature and expiration; if valid, populate Spring Security's SecurityContext.
      if (user != null && jwtService.validateToken(token, user)) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities());

        authenticationToken.setDetails(
            new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
      }
    }

    // 5️⃣ Continue filter chain to target controller method.
    filterChain.doFilter(request, response);
  }
}