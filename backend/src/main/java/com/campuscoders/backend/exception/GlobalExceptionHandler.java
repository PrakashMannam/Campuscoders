package com.campuscoders.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Centralized exception handling across all REST controllers, ensuring consistent JSON error responses for the frontend.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles domain-specific business exceptions thrown anywhere in service layers (e.g., duplicate check-in, resource not found).
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorDetails> handleCustomException(CustomException ex) {
        ErrorDetails errorDetails = new ErrorDetails(ex.getMessage(), ex.getHttpStatus().value());
        return new ResponseEntity<>(errorDetails, ex.getHttpStatus());
    }

    // Catch-all safety fallback for unexpected runtime errors, preventing raw stack traces from leaking to the client.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex) {
        ErrorDetails errorDetails = new ErrorDetails("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}