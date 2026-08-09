package com.campuscoders.backend.exception;

/**
 * Simple DTO to represent error details in API responses.
 */
public class ErrorDetails {
    private String message;
    private int status;

    public ErrorDetails(String message, int status) {
        this.message = message;
        this.status = status;
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
}
