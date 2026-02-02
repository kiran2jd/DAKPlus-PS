package com.mockanytime.scoringservice.service;

import com.mockanytime.scoringservice.client.AssessmentClient;
import com.mockanytime.scoringservice.dto.TestDto;
import com.mockanytime.scoringservice.model.Result;
import com.mockanytime.scoringservice.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ResultService {

    private final ResultRepository resultRepository;
    private final AssessmentClient assessmentClient;

    public ResultService(ResultRepository resultRepository, AssessmentClient assessmentClient) {
        this.resultRepository = resultRepository;
        this.assessmentClient = assessmentClient;
    }

    public Result submitTest(String testId, String userId, Map<String, String> answers) {
        return submitTest(testId, userId, answers, 0);
    }

    public Result submitTest(String testId, String userId, Map<String, String> answers, long timeTakenSeconds) {
        TestDto test = assessmentClient.getTestById(testId);

        int score = 0;
        int totalPoints = 0;
        int correctCount = 0;
        int wrongCount = 0;
        Map<String, Result.AnswerDetail> detailedAnswers = new HashMap<>();

        // Calculate scores and build detailed answer breakdown
        for (int i = 0; i < test.questions().size(); i++) {
            var q = test.questions().get(i);
            totalPoints += q.points();

            String userAnswer = answers.get(String.valueOf(i));
            String correctAnswer = q.correctAnswer();
            boolean isCorrect = userAnswer != null && correctAnswer != null &&
                    userAnswer.trim().equalsIgnoreCase(correctAnswer.trim());

            if (isCorrect) {
                score += q.points();
                correctCount++;
            } else {
                wrongCount++;
            }

            // Build detailed answer for review
            Result.AnswerDetail detail = new Result.AnswerDetail(
                    q.text(),
                    userAnswer != null ? userAnswer : "Not Answered",
                    correctAnswer,
                    q.explanation(),
                    isCorrect,
                    isCorrect ? q.points() : 0);
            detailedAnswers.put(String.valueOf(i), detail);
        }

        double percentage = totalPoints > 0 ? ((double) score / totalPoints) * 100 : 0;
        double accuracy = !test.questions().isEmpty() ? ((double) correctCount / test.questions().size()) * 100 : 0;

        Result result = new Result();
        result.setTestId(testId);
        result.setTestTitle(test.title());
        result.setUserId(userId);
        result.setScore(score);
        result.setTotalPoints(totalPoints);
        result.setPercentage(Math.round(percentage * 100.0) / 100.0);
        result.setAccuracy(Math.round(accuracy * 100.0) / 100.0);
        result.setAnswers(answers);
        result.setTimeTakenSeconds(timeTakenSeconds);
        result.setCorrectAnswers(correctCount);
        result.setWrongAnswers(wrongCount);
        result.setDetailedAnswers(detailedAnswers);

        Result savedResult = resultRepository.save(result);

        // Calculate rank (leaderboard position for this test)
        calculateRank(savedResult);

        return savedResult;
    }

    private void calculateRank(Result result) {
        // Get all results for this test, sorted by score descending
        java.util.List<Result> allResults = resultRepository.findByTestIdOrderByScoreDesc(result.getTestId());

        int rank = 1;
        for (Result r : allResults) {
            if (r.getId().equals(result.getId())) {
                result.setRank(rank);
                resultRepository.save(result);
                break;
            }
            rank++;
        }
    }

    public long countUniqueStudentsForTests(java.util.List<String> testIds) {
        // In a real MongoDB environment, we would use an aggregation or
        // distinct query. For simplicity with the current repository:
        Map<String, Boolean> uniqueUsers = new HashMap<>();
        for (String testId : testIds) {
            java.util.List<Result> results = resultRepository.findByTestId(testId);
            for (Result r : results) {
                uniqueUsers.put(r.getUserId(), true);
            }
        }
        return uniqueUsers.size();
    }

    public Optional<Result> getResult(String id) {
        return resultRepository.findById(id);
    }

    public Iterable<Result> getResultsByUserId(String userId) {
        return resultRepository.findByUserId(userId);
    }

    public Iterable<Result> getResultsByTestId(String testId) {
        return resultRepository.findByTestIdOrderByScoreDesc(testId);
    }
}
