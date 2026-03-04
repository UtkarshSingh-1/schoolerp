import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoringService {
    /**
     * Map percentage score to 4.0 GPA scale
     * Ported from legacy GradebookService
     */
    calculateGPAPoint(score: number): number {
        if (score >= 90) return 4.0;
        if (score >= 80) return 3.0;
        if (score >= 70) return 2.0;
        if (score >= 60) return 1.0;
        return 0.0;
    }

    /**
     * Get Grade Letter from score
     * Ported from legacy GradebookService
     */
    calculateGradeLetter(score: number): string {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Calculate final result for an exam attempt
     */
    calculateResult(totalMarks: number, obtainedMarks: number) {
        const percentage = (obtainedMarks / totalMarks) * 100;
        return {
            score: percentage,
            grade: this.calculateGradeLetter(percentage),
            gpaPoint: this.calculateGPAPoint(percentage)
        };
    }
}
