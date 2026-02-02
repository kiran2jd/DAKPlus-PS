package com.mockanytime.scoringservice.repository;

import com.mockanytime.scoringservice.model.Result;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends MongoRepository<Result, String> {
    List<Result> findByUserId(String userId);

    List<Result> findByTestId(String testId);

    List<Result> findByTestIdOrderByScoreDesc(String testId);
}
