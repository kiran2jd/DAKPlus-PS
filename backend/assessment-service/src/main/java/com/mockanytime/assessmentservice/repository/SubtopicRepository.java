package com.mockanytime.assessmentservice.repository;

import com.mockanytime.assessmentservice.model.Subtopic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtopicRepository extends MongoRepository<Subtopic, String> {
    List<Subtopic> findByTopicId(String topicId);
}
