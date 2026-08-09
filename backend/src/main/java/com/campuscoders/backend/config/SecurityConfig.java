package com.campuscoders.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.campuscoders.backend.security.JwtAuthenticationFilter;

// Enables method-level security annotations like @PreAuthorize("hasRole('ADMIN')") on controllers and services.
@EnableMethodSecurity
@Configuration
public class SecurityConfig {

  private final JwtAuthenticationFilter authenticationFilter;

  public SecurityConfig(JwtAuthenticationFilter authenticationFilter) {
    this.authenticationFilter = authenticationFilter;
  }

  // BCrypt uses adaptive key stretching and automatic salt generation for secure, one-way password hashing.
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  // Configures the HTTP request security filter chain, public route permits, stateless sessions, and custom JWT filter insertion.
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        // 1️⃣ Disable CSRF because REST APIs use token-based authentication via headers, not browser session cookies.
        .csrf(csrf -> csrf.disable())
        // 2️⃣ Enforce stateless session policy — no HTTP server sessions (JSESSIONID) are created or stored on the backend.
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // 3️⃣ Define route access rules: public endpoints are permitted without auth token; all other requests require a valid JWT.
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/api/auth/register",
                "/api/auth/login")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/learning-paths/**")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/topics/*/resources")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/resources/**")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/profile/public/**")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/announcements")
            .permitAll()
            .anyRequest()
            .authenticated())
        // 4️⃣ Insert custom JwtAuthenticationFilter into the filter chain BEFORE standard UsernamePasswordAuthenticationFilter.
        .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}