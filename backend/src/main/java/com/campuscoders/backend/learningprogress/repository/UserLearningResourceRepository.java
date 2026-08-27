package com.campuscoders.backend.learningprogress.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campuscoders.backend.learningprogress.UserLearningResource;

public interface UserLearningResourceRepository extends JpaRepository<UserLearningResource, Long> {

  // Spring Data JPA derives SQL query automatically based on field names: user.id and resource.id
  boolean existsByUserIdAndResourceId(Long userId, Long resourceId);

  Optional<UserLearningResource> findByUserIdAndResourceId(Long userId, Long resourceId);

  // Fast fetch of all completed items for a given user without loading unneeded global progress data.
  List<UserLearningResource> findAllByUserId(Long userId);

  // Derived JPA count query: Counts user completions for resources belonging to a specific Learning Path.
  long countByUserIdAndResourceTopicLearningPathId(Long userId, Long learningPathId);

  // Derived JPA count query: Counts user completions for resources belonging to a specific Topic.
  long countByUserIdAndResourceTopicId(Long userId, Long topicId);

  void deleteByResourceTopicId(Long topicId);

  void deleteByResourceTopicLearningPathId(Long learningPathId);

  @Query("""
      select distinct t.learningPath.id
      from UserLearningResource ulr
      join ulr.resource r
      join r.topic t
      where ulr.user.id = :userId
      """)
  List<Long> findDistinctLearningPathIdsByUserId(@Param("userId") Long userId);
}
