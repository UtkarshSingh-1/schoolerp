// Mock Question Controller
exports.getAllQuestions = async (req, res) => {
    res.json([
        { id: 1, text: 'What is the capital of France?', subject: 'Geography', difficulty: 'Easy', type: 'MCQ' },
        { id: 2, text: 'Solve for x: 2x + 5 = 15', subject: 'Mathematics', difficulty: 'Medium', type: 'MCQ' }
    ]);
};

exports.createQuestion = async (req, res) => {
    const { text, subject, topic, difficulty, options, type } = req.body;
    // In production: await Question.create(...)
    res.status(201).json({ message: 'Question created successfully', id: Date.now() });
};

exports.deleteQuestion = async (req, res) => {
    res.json({ message: 'Question deleted' });
};
