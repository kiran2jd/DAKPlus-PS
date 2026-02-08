package com.mockanytime.assessmentservice.service;

import com.mockanytime.assessmentservice.model.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.parser.BeanOutputParser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionExtractionService {

    private final ChatClient chatClient;

    public List<Question> extractQuestions(String text, String topicId, String subtopicId) {
        String promptString = """
                Analyze the following text and extract all multiple choice questions.
                For each question, identify:
                - The question text
                - Four options (a, b, c, d)
                - The correct answer

                CRITICAL RULES:
                1. The output MUST be a valid JSON object with a single key "questions" containing an array of question objects.
                2. Each question object MUST have: "text", "options" (array of 4 strings), "correctAnswer", "type" ("mcq"), "points" (1).
                3. The "correctAnswer" MUST match one of the strings in the "options" array EXACTLY.
                4. If the source text says "Answer: c) Some Text", the "correctAnswer" should be "Some Text" if that is what you put in the options array. Do not include the "c)" prefix in the final options or correctAnswer unless it is part of the actual choice content.
                5. Strip any leading labels like "110)", "a)", "b)", etc., from the question and option text to keep it clean.

                EXAMPLE OUTPUT FORMAT:
                {
                  "questions": [
                    {
                      "text": "What is the capital of France?",
                      "options": ["Paris", "London", "Berlin", "Madrid"],
                      "correctAnswer": "Paris",
                      "type": "mcq",
                      "points": 1
                    }
                  ]
                }

                Text to analyze:
                {text}
                """;

        BeanOutputParser<QuestionList> parser = new BeanOutputParser<>(QuestionList.class);

        Prompt prompt = new Prompt(promptString.replace("{text}", text));
        long startTime = System.currentTimeMillis();
        System.out.println("Sending extraction prompt to Groq (Doc Length: " + text.length() + " chars)...");

        String response;
        try {
            response = chatClient.call(prompt).getResult().getOutput().getContent();
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("AI Response received in " + duration + "ms. Response Length: " + response.length());
        } catch (Exception e) {
            System.err.println(
                    "API Call failed after " + (System.currentTimeMillis() - startTime) + "ms: " + e.getMessage());
            throw e;
        }

        // Basic cleanup of response in case AI adds markdown
        if (response.contains("```json")) {
            response = response.substring(response.indexOf("```json") + 7);
            if (response.contains("```")) {
                response = response.substring(0, response.indexOf("```"));
            }
        } else if (response.contains("```")) {
            response = response.substring(response.indexOf("```") + 3);
            if (response.contains("```")) {
                response = response.substring(0, response.indexOf("```"));
            }
        }

        response = response.trim();

        try {
            // Using simple structure for the output parser or manual mapping if needed.
            QuestionList parsed = parser.parse(response);
            List<Question> questions = parsed.getQuestions();
            if (questions != null) {
                questions.forEach(q -> {
                    q.setTopicId(topicId);
                    q.setSubtopicId(subtopicId);
                    if (q.getType() == null)
                        q.setType("mcq");
                    if (q.getPoints() == 0)
                        q.setPoints(1);
                });
                System.out.println("Successfully extracted " + questions.size() + " questions.");
                return questions;
            }
        } catch (Exception e) {
            System.err.println("Failed to parse AI response as JSON: " + e.getMessage());
            // Fallback: try to find a JSON array manually if parser fails
            if (response.contains("[") && response.contains("]")) {
                try {
                    String possibleArray = response.substring(response.indexOf("["), response.lastIndexOf("]") + 1);
                    // This is still risky without a real JSON library here, but parser might be too
                    // strict
                    System.out.println("Attempting fallback parsing for: " + possibleArray);
                } catch (Exception e2) {
                    System.err.println("Fallback parsing also failed.");
                }
            }
        }
        return List.of();
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
