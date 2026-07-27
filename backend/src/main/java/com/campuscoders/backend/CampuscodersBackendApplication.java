package com.campuscoders.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CampuscodersBackendApplication {

  // Application entry point. Spring Boot starts component scanning from this package.
  public static void main(String[] args) {
    SpringApplication.run(CampuscodersBackendApplication.class, args);
  }
}