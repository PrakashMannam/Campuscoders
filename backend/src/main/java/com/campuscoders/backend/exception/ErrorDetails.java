package com.campuscoders.backend.exception;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Simple DTO to represent error details in API responses.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorDetails {
    private String message;
    private int status;
    private Map<String, String> validationErrors;

    public ErrorDetails(String message, int status) {
        this.message = message;
        this.status = status;
    }

    public ErrorDetails(String message, int status, Map<String, String> validationErrors) {
        this.message = message;
        this.status = status;
        this.validationErrors = validationErrors;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }

    public void setValidationErrors(Map<String, String> validationErrors) {
        this.validationErrors = validationErrors;
    }
}
