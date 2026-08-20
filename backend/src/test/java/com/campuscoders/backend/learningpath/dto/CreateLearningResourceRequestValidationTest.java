package com.campuscoders.backend.learningpath.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.ResourceType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreateLearningResourceRequestValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenValidRequest_thenNoViolations() {
        CreateLearningResourceRequest request = new CreateLearningResourceRequest(
                1L,
                "Valid Title",
                "Valid Description",
                ResourceType.VIDEO,
                DifficultyLevel.BEGINNER,
                "http://example.com/video",
                "YouTube",
                "https://example.com/thumbnail.png",
                10,
                1
        );

        Set<ConstraintViolation<CreateLearningResourceRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Expected no violations for valid request");
    }

    @Test
    void whenInvalidUrl_thenViolation() {
        CreateLearningResourceRequest request = new CreateLearningResourceRequest(
                1L,
                "Valid Title",
                "Valid Description",
                ResourceType.VIDEO,
                DifficultyLevel.BEGINNER,
                "invalid-url",
                "YouTube",
                "",
                10,
                1
        );

        Set<ConstraintViolation<CreateLearningResourceRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Expected violations for invalid URL");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("url")), "Expected violation on url property");
    }

    @Test
    void whenNegativeEstimatedMinutes_thenViolation() {
        CreateLearningResourceRequest request = new CreateLearningResourceRequest(
                1L,
                "Valid Title",
                "Valid Description",
                ResourceType.VIDEO,
                DifficultyLevel.BEGINNER,
                "http://example.com/video",
                "YouTube",
                "",
                -5,
                1
        );

        Set<ConstraintViolation<CreateLearningResourceRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Expected violations for negative estimated minutes");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("estimatedMinutes")), "Expected violation on estimatedMinutes property");
    }
}
