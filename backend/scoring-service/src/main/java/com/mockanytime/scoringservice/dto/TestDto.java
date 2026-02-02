package com.mockanytime.scoringservice.dto;

import java.util.List;

public record TestDto(
                String id,
                String title,
                List<QuestionDto> questions) {
}
