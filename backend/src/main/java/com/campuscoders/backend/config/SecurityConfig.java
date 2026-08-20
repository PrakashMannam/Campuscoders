package com.campuscoders.backend.config;

import java.util.Arrays;
import java.util.List;

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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.campuscoders.backend.security.CustomAccessDeniedHandler;
import com.campuscoders.backend.security.CustomAuthenticationEntryPoint;
import com.campuscoders.backend.security.JwtAuthenticationFilter;

// Enables method-level security annotations like @PreAuthorize("hasRole('ADMIN')") on controllers and services.
@EnableMethodSecurity
@Configuration
public class SecurityConfig {

  private final JwtAuthenticationFilter authenticationFilter;
  private final CustomAuthenticationEntryPoint authenticationEntryPoint;
  private final CustomAccessDeniedHandler accessDeniedHandler;

  public SecurityConfig(
      JwtAuthenticationFilter authenticationFilter,
      CustomAuthenticationEntryPoint authenticationEntryPoint,
      CustomAccessDeniedHandler accessDeniedHandler) {
    this.authenticationFilter = authenticationFilter;
    this.authenticationEntryPoint = authenticationEntryPoint;
    this.accessDeniedHandler = accessDeniedHandler;
  }

  // BCrypt uses adaptive key stretching and automatic salt generation for secure,
  // one-way password hashing.
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  // Allow React dev servers on ports 3000 and 3030 to call the Spring Boot API.
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:3000",
        "http://localhost:3030"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }

  // Configures the HTTP request security filter chain, public route permits,
  // stateless sessions, and custom JWT filter insertion.
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        // 0. Enable CORS using the bean above so browsers allow cross-origin API calls.
        .cors(c -> c.configurationSource(corsConfigurationSource()))
        // 1. Disable CSRF because REST APIs use token-based authentication via headers,
        // not browser session cookies.
        .csrf(csrf -> csrf.disable())
        // Configure centralized error handling for authentication (401) and authorization (403)
        .exceptionHandling(exceptions -> exceptions
            .authenticationEntryPoint(authenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler))
        // 2. Enforce stateless session policy - no HTTP server sessions (JSESSIONID)
        // are created or stored on the backend.
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // 3. Define route access rules: public endpoints are permitted without auth
        // token; all other requests require a valid JWT.
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/api/auth/register",
                "/api/auth/login",
                "/api/auth/forgot-password",
                "/api/auth/reset-password")
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
            .requestMatchers(HttpMethod.GET, "/api/discussion-categories")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/discussions/**")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/leaderboard", "/api/leaderboard/top")
            .permitAll()
            .anyRequest()
            .authenticated())
        // 4. Insert custom JwtAuthenticationFilter into the filter chain BEFORE
        // standard UsernamePasswordAuthenticationFilter.
        .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}
