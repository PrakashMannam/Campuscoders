package com.campuscoders.backend.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

  // Small protected endpoint used to verify JWT authentication from Postman.
  @GetMapping("/protected")
  public String protectedRoute() {
    return "You are authenticated";
  }
}