package com.mockanytime.assessmentservice.repository;

import com.mockanytime.assessmentservice.model.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepository extends MongoRepository<Topic, String> {
}
