const PDFDocument = require('pdfkit');

class ReportingService {
    // ... calculateGrade and other methods remain same

    static generatePDF(data, res) {
        const doc = new PDFDocument({ margin: 50 });

        // Pipe the PDF into the response
        doc.pipe(res);

        // Header
        doc.fillColor('#444444')
            .fontSize(20)
            .text(data.institution.name, 110, 57)
            .fontSize(10)
            .text(data.institution.address, 110, 80)
            .moveDown();

        // Line
        doc.moveTo(50, 110).lineTo(550, 110).stroke();

        // Student Info
        doc.fontSize(12).text(`Report Card - Session ${data.student.session}`, 50, 130);
        doc.fontSize(10)
            .text(`Name: ${data.student.name}`, 50, 150)
            .text(`ID: ${data.student.id}`, 50, 165)
            .text(`Class: ${data.student.class}`, 350, 150)
            .text(`Roll No: ${data.student.roll}`, 350, 165);

        // Table Header
        let y = 200;
        doc.fillColor('#f0f0f0').rect(50, y, 500, 20).fill();
        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
            .text('Subject', 70, y + 5)
            .text('Score', 250, y + 5)
            .text('Grade', 450, y + 5);

        // Table Rows
        y += 25;
        doc.font('Helvetica');
        data.performance.forEach((item) => {
            doc.text(item.subject, 70, y)
                .text(item.score.toString(), 250, y)
                .text(item.grade, 450, y);
            y += 20;
        });

        // Summary
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text(`Total: ${data.summary.totalMarks}`, 50, y + 30);
        doc.text(`Percentage: ${data.summary.percentage}`, 50, y + 50);
        doc.fillColor(data.summary.result === 'Passed' ? 'green' : 'red')
            .text(`Result: ${data.summary.result}`, 350, y + 30);

        // Footer
        doc.fillColor('#999999').fontSize(8)
            .text('This is a computer generated document and does not require a physical signature.', 50, 700, { align: 'center' });

        doc.end();
    }

    static calculateGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'F';
    }

    static generateReportData(student, marks) {
        const total = marks.reduce((acc, m) => acc + (parseFloat(m.marks_obtained) || 0), 0);
        const average = marks.length > 0 ? total / marks.length : 0;

        return {
            institution: {
                name: 'Antigravity International School',
                address: '123 Academic Way, Knowledge City'
            },
            student: {
                id: student.student_id,
                name: `${student.first_name} ${student.last_name}`,
                class: student.class,
                roll: student.student_id, // Using student_id as roll for now
                session: '2025-26'
            },
            performance: marks.map(m => ({
                subject: m.subject_name,
                score: m.marks_obtained,
                grade: this.calculateGrade(m.marks_obtained)
            })),
            summary: {
                totalMarks: total,
                percentage: `${average.toFixed(2)}%`,
                result: average >= 40 ? 'Passed' : 'Failed'
            }
        };
    }
}

module.exports = ReportingService;
