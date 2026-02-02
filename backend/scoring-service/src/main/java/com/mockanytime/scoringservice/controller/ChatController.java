package com.mockanytime.scoringservice.controller;

import com.mockanytime.scoringservice.dto.ChatRequest;
import com.mockanytime.scoringservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public String chat(@RequestBody ChatRequest request) {
        return chatService.getChatResponse(request.getMessage());
    }
}
