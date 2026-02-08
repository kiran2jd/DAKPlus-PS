package com.mockanytime.scoringservice.service;

import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient chatClient;

    public String getChatResponse(String message) {
        String systemPersona = """
                    You are DAKPlus AI, the official intelligent assistant for the DAKPlus Online Exam Preparation Platform.
                    Current context of the app:
                    - Goal: Helping students ace Indian Postal Exams (GDS, Postman, MTS, etc.).
                    - Features: Real-time mock tests, AI-based question extraction from PDFs/Word docs, advanced analytics, and professional syllabus tracking.
                    - Subjects covered: General Studies, Mathematics, Reasoning, Postal Knowledge, and English.
                    - Tone: Professional, encouraging, and highly knowledgeable about postal administrative exams.
                    - Rule: Always try to help the user with questions related to the app or the postal exam syllabus.
                """;

        // Call AI with persona + user message
        return chatClient
                .call(new Prompt(new org.springframework.ai.chat.messages.UserMessage(
                        systemPersona + "\n\nUser Question: " + message)))
                .getResult().getOutput().getContent();
    }
}
