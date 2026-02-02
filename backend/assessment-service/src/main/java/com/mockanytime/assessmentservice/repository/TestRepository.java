package com.mockanytime.assessmentservice.repository;

import com.mockanytime.assessmentservice.model.Test;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TestRepository extends MongoRepository<Test, String> {
    List<Test> findByCreatedBy(String createdBy);
}
