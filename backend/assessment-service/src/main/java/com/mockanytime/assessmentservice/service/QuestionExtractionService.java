package com.mockanytime.assessmentservice.service;

import com.mockanytime.assessmentservice.model.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.parser.BeanOutputParser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionExtractionService {

    private final ChatClient chatClient;

    public List<Question> extractQuestions(String text) {
        String promptString = """
                Analyze the following text and extract all multiple choice questions.
                For each question, identify:
                - The question text
                - Four options
                - The correct answer (must match one of the options exactly)

                Format the output as a JSON array of objects with the following fields:
                - text: The question string
                - options: An array of 4 strings
                - correctAnswer: One of the strings from the options array
                - type: Always "mcq"
                - points: Default to 1

                Text to analyze:
                {text}
                """;

        BeanOutputParser<QuestionList> parser = new BeanOutputParser<>(QuestionList.class);

        Prompt prompt = new Prompt(promptString.replace("{text}", text));
        String response = chatClient.call(prompt).getResult().getOutput().getContent();

        // Basic cleanup of response in case AI adds markdown
        if (response.contains("```json")) {
            response = response.substring(response.indexOf("```json") + 7);
            response = response.substring(0, response.indexOf("```"));
        }

        // Using simple structure for the output parser or manual mapping if needed.
        // For this implementation, we will use a dedicated DTO for the list.
        return parser.parse(response).getQuestions();
    }

    public static class QuestionList {
        private List<Question> questions;

        public List<Question> getQuestions() {
            return questions;
        }

        public void setQuestions(List<Question> questions) {
            this.questions = questions;
        }
    }
}
