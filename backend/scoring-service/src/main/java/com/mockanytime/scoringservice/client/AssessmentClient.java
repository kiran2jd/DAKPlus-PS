package com.mockanytime.scoringservice.client;

import com.mockanytime.scoringservice.dto.TestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "assessment-service", url = "${ASSESSMENT_SERVICE_HOST:http://assessment-service:8082}")
public interface AssessmentClient {
    @GetMapping("/tests/{id}")
    TestDto getTestById(@PathVariable("id") String id);
}
