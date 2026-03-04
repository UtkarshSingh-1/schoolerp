/**
 * Gradebook Service
 * Handles calculation of GPA, weighted averages, and performance metrics.
 */

class GradebookService {
    /**
     * Calculate GPA based on a standard 4.0 scale
     * @param {Array} scores - Array of objects { score, weight }
     * @returns {number} - Calculated GPA
     */
    static calculateGPA(scores) {
        if (!scores || scores.length === 0) return 0;

        let totalPoints = 0;
        let totalWeight = 0;

        scores.forEach(s => {
            const weight = s.weight || 1;
            const gpaPoint = this.scoreToGPAPoint(s.score);
            totalPoints += gpaPoint * weight;
            totalWeight += weight;
        });

        const gpa = totalPoints / totalWeight;
        return Math.round(gpa * 100) / 100;
    }

    /**
     * Map percentage score to 4.0 GPA scale
     * @param {number} score - Percentage score (0-100)
     * @returns {number} - GPA point
     */
    static scoreToGPAPoint(score) {
        if (score >= 90) return 4.0;
        if (score >= 80) return 3.0;
        if (score >= 70) return 2.0;
        if (score >= 60) return 1.0;
        return 0.0;
    }

    /**
     * Get Grade Letter from score
     * @param {number} score 
     * @returns {string} - Grade (A-F)
     */
    static getGradeLetter(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Generate performance insights
     * @param {Array} history - Array of previous results
     * @returns {Object} - Trends and suggestions
     */
    static getInsights(history) {
        // Mock logic for trend analysis
        const average = history.reduce((acc, h) => acc + h.score, 0) / history.length;
        return {
            trend: average > 80 ? 'Improving' : 'Stagnant',
            suggestion: average < 75 ? 'Recommended extra tutoring in weak subjects.' : 'Consistency is key. Great job!'
        };
    }
}

module.exports = GradebookService;
