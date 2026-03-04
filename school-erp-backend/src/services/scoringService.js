/**
 * Scoring Service for Entrance Exams
 */

class ScoringService {
    /**
     * Calculate score for a digital exam submission
     * @param {Array} questions - Array of question objects with correct answers
     * @param {Object} submission - Student's answers { questionId: answer }
     * @returns {Object} - Results { total, scored, percentage, passed }
     */
    static calculateScore(questions, submission, passingMark = 40) {
        let scored = 0;
        const total = questions.length;

        questions.forEach(q => {
            if (submission[q.id] === q.correctAnswer) {
                scored += q.weight || 1;
            }
        });

        const totalWeight = questions.reduce((acc, q) => acc + (q.weight || 1), 0);
        const percentage = (scored / totalWeight) * 100;

        return {
            total: totalWeight,
            scored,
            percentage: Math.round(percentage * 100) / 100,
            passed: percentage >= passingMark
        };
    }

    /**
     * Generate Merit List
     * @param {Array} candidates - Array of candidate results
     * @param {number} seats - Number of available seats
     * @returns {Array} - Ranked candidates with status
     */
    static generateMeritList(candidates, seats) {
        return candidates
            .sort((a, b) => b.score - a.score || a.tieBreakerTime - b.tieBreakerTime)
            .map((c, index) => ({
                ...c,
                rank: index + 1,
                status: index < seats ? 'Selected' : 'Waiting'
            }));
    }
}

module.exports = ScoringService;
