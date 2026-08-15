package com.campuscoders.backend.dailychallenge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.dailychallenge.CodingProblem;

public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {

  List<CodingProblem> findByActiveTrueOrderByTitleAsc();

  List<CodingProblem> findAllByOrderByCreatedAtDesc();

  Optional<CodingProblem> findByIdAndActiveTrue(Long id);

  boolean existsByTitle(String title);
}
