package com.campuscoders.backend.test;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class TestController {
  
  @GetMapping("/api/test/protected")
  public String protectedRoute() {
    return "You are authenticated";
  }
  
}
