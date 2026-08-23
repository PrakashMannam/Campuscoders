package com.campuscoders.backend.event.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campuscoders.backend.event.CampusEvent;

public interface CampusEventRepository extends JpaRepository<CampusEvent, Long> {

  List<CampusEvent> findAllByOrderByStartsAtDesc();

  @Query("""
      select e from CampusEvent e
      where e.active = true
        and (
          (e.endsAt is not null and e.endsAt >= :now)
          or (e.endsAt is null and e.startsAt >= :now)
        )
      order by e.startsAt asc
      """)
  List<CampusEvent> findUpcoming(@Param("now") Instant now);
}
