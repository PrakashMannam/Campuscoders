package com.campuscoders.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// Centralized exception handling across all REST controllers, ensuring consistent JSON error responses for the frontend.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles domain-specific business exceptions thrown anywhere in service layers (e.g., duplicate check-in, resource not found).
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorDetails> handleCustomException(CustomException ex) {
        ErrorDetails errorDetails = new ErrorDetails(ex.getMessage(), ex.getHttpStatus().value());
        return new ResponseEntity<>(errorDetails, ex.getHttpStatus());
    }

    // Handles Spring's ResponseStatusException (e.g., 404 Not Found, 400 Bad Request, 409 Conflict)
    // Preserves the HTTP status and reason instead of converting to 500
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorDetails> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString();
        ErrorDetails errorDetails = new ErrorDetails(message, ex.getStatusCode().value());
        return new ResponseEntity<>(errorDetails, ex.getStatusCode());
    }

    // Handles Phase 2 DTO validation errors (e.g., @NotBlank, @PositiveOrZero)
    // Extracts field-specific violation messages to return inside validationErrors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(error.getField(), error.getDefaultMessage());
        }
        ErrorDetails errorDetails = new ErrorDetails("Validation failed", HttpStatus.BAD_REQUEST.value(), validationErrors);
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    // Catch-all safety fallback for unexpected runtime errors, preventing raw stack traces from leaking to the client.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex) {
        ErrorDetails errorDetails = new ErrorDetails("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}