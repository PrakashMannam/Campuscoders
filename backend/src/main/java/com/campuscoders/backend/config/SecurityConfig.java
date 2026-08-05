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

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

  private final JwtAuthenticationFilter authenticationFilter;

  public SecurityConfig(JwtAuthenticationFilter authenticationFilter) {
    this.authenticationFilter = authenticationFilter;
  }

  // BCrypt is a one-way password hash designed for storing user passwords safely.
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        // JWT APIs are stateless; the server does not keep login sessions.
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
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
        // Run our JWT filter before Spring Security's username/password filter.
        .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}