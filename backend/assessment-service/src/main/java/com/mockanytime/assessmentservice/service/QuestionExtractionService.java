package com.mockanytime.assessmentservice.service;

import com.mockanytime.assessmentservice.model.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.parser.BeanOutputParser;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionExtractionService {

    private final ChatClient chatClient;

    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url:}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        System.out.println("AI Extraction Service Initialized.");
        System.out.println("Base URL: " + baseUrl);
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("WARNING: AI API Key is MISSING!");
        } else {
            String maskedKey = apiKey.length() > 8
                    ? apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length() - 3)
                    : "***";
            System.out.println(
                    "AI API Key is present. Key hint: " + maskedKey + " (Total Length: " + apiKey.length() + ")");
        }
    }

    public List<Question> extractQuestions(String text, String topicId, String subtopicId) {
        String promptString = """
                Extract all multiple choice questions from the provided text.
                The text may contain OCR noise or fragments labeled "[Image Text Content]:".
                Synthesize coherent questions from these fragments if they appear to belong together.

                EXTRACT:
                - Question text (clear and concise)
                - Options (exactly four: a, b, c, d)
                - Correct Answer (one of the options)

                RULES:
                1. JSON ONLY. No explanation text outside the JSON.
                2. "correctAnswer" must match one of the "options" exactly.
                3. Clean OCR noise (random symbols, broken words).
                4. If a question is incomplete, skip it rather than guessing.

                FORMAT:
                {
                  "questions": [
                    {
                      "text": "...",
                      "options": ["...", "...", "...", "..."],
                      "correctAnswer": "...",
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
