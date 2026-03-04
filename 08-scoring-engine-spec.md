# Scoring Engine Specification

## 1. Overview
The scoring engine is responsible for automatically evaluating student/applicant exams, specifically focusing on MCQ-based tests during the admission phase.

## 2. Logic
- **Input**: List of answers (Question ID + Selected Option).
- **Process**:
    1. Fetch correct answers from `exam_questions` table for the given `exam_id`.
    2. Compare user selections against correct answers.
    3. Calculate total score based on: `Correct * MarksPerQuestion`.
- **Output**: Total marks obtained and pass/fail status based on a configurable threshold.

## 3. Storage
- Results are stored in the `exam_results` table.
- Each result entry is linked to an `applicant_id` and `exam_id`.

## 4. Performance
- Scoring should be idempotent (re-calculating results should yield the same score).
- Heavy result calculation for batch exams should be queued if necessary.
