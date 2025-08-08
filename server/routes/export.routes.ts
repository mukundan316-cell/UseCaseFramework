import { Request, Response, Router } from 'express';
import { db } from '../db';
import { 
  questionnaireResponses, 
  questionAnswers,
  questions,
  questionnaireSections,
  questionnaires,
  questionOptions,
  useCases
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/responses/:id/export
 * Export assessment response in multiple formats
 * Supports: pdf, excel, json
 */
router.get('/responses/:id/export', async (req: Request, res: Response) => {
  try {
    const responseId = req.params.id;
    const format = req.query.format as string || 'json';

    // Validate format
    if (!['pdf', 'excel', 'json'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format. Supported: pdf, excel, json' });
    }

    // Get complete response data
    const responseData = await getCompleteResponseData(responseId);
    
    if (!responseData) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Generate export based on format
    switch (format) {
      case 'json':
        return exportAsJSON(res, responseData);
      case 'excel':
        return exportAsExcel(res, responseData);
      case 'pdf':
        return exportAsPDF(res, responseData);
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export response data' });
  }
});

/**
 * Get complete response data with all related information
 */
async function getCompleteResponseData(responseId: string) {
  try {
    // Get response details
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) return null;

    // Get questionnaire details
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, response.questionnaireId));

    // Get all answers with question details
    const answersWithQuestions = await db
      .select({
        answer: questionAnswers,
        question: questions,
        section: questionnaireSections,
        options: questionOptions
      })
      .from(questionAnswers)
      .innerJoin(questions, eq(questions.id, questionAnswers.questionId))
      .innerJoin(questionnaireSections, eq(questionnaireSections.id, questions.sectionId))
      .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
      .where(eq(questionAnswers.responseId, responseId))
      .orderBy(questionnaireSections.sectionOrder, questions.questionOrder);

    // Get sample recommendations (in a real system, this would be based on assessment results)
    const recommendations = await db
      .select()
      .from(useCases)
      .limit(10);

    // Calculate maturity scores
    const maturityScores = calculateMaturityScores(answersWithQuestions);

    return {
      response,
      questionnaire,
      answers: answersWithQuestions,
      recommendations: recommendations,
      maturityScores,
      exportedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error getting complete response data:', error);
    return null;
  }
}

/**
 * Calculate maturity scores from answers
 */
function calculateMaturityScores(answersWithQuestions: any[]) {
  const scoresBySection = answersWithQuestions.reduce((acc, { answer, section, question }) => {
    if (!acc[section.id]) {
      acc[section.id] = {
        sectionTitle: section.title,
        scores: [],
        totalScore: 0,
        averageScore: 0
      };
    }

    if (answer.score) {
      acc[section.id].scores.push(answer.score);
      acc[section.id].totalScore += answer.score;
    }

    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.values(scoresBySection).forEach((section: any) => {
    if (section.scores.length > 0) {
      section.averageScore = section.totalScore / section.scores.length;
      section.maturityLevel = getMaturityLevel(section.averageScore);
      section.percentage = Math.round((section.averageScore / 5) * 100);
    }
  });

  // Overall scores
  const allScores = Object.values(scoresBySection).flatMap((section: any) => section.scores);
  const overallAverage = allScores.length > 0 
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
    : 0;

  return {
    sections: scoresBySection,
    overall: {
      averageScore: overallAverage,
      totalScore: allScores.reduce((sum, score) => sum + score, 0),
      maturityLevel: getMaturityLevel(overallAverage),
      percentage: Math.round((overallAverage / 5) * 100),
      totalResponses: allScores.length
    }
  };
}

/**
 * Get maturity level from score
 */
function getMaturityLevel(score: number): string {
  if (score >= 4.5) return 'Optimized';
  if (score >= 3.5) return 'Managed';
  if (score >= 2.5) return 'Defined';
  if (score >= 1.5) return 'Repeatable';
  return 'Initial';
}

/**
 * Export as JSON
 */
function exportAsJSON(res: Response, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="assessment-export.json"');
  res.json(data);
}

/**
 * Export as Excel (CSV format for simplicity)
 */
function exportAsExcel(res: Response, data: any) {
  const csvData = generateCSV(data);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="assessment-export.xlsx"');
  res.send(csvData);
}

/**
 * Export as PDF (HTML format that browsers can print to PDF)
 */
function exportAsPDF(res: Response, data: any) {
  const htmlContent = generatePDFHTML(data);
  
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', 'attachment; filename="assessment-export.html"');
  res.send(htmlContent);
}

/**
 * Generate CSV content
 */
function generateCSV(data: any): string {
  const lines = [];
  
  // Header
  lines.push('Section,Question,Answer,Score,Date');
  
  // Data rows
  data.answers.forEach(({ answer, question, section }: any) => {
    const row = [
      `"${section.title}"`,
      `"${question.questionText}"`,
      `"${answer.answerValue}"`,
      answer.score || '',
      answer.answeredAt ? new Date(answer.answeredAt).toLocaleDateString() : ''
    ];
    lines.push(row.join(','));
  });
  
  // Summary section
  lines.push('');
  lines.push('SUMMARY');
  lines.push(`Overall Score,${data.maturityScores.overall.percentage}%`);
  lines.push(`Maturity Level,${data.maturityScores.overall.maturityLevel}`);
  lines.push(`Total Responses,${data.maturityScores.overall.totalResponses}`);
  
  return lines.join('\n');
}

/**
 * Generate PDF-ready HTML
 */
function generatePDFHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI Maturity Assessment Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #005DAA; padding-bottom: 20px; }
        .title { color: #005DAA; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 14px; }
        .summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .score-card { display: inline-block; text-align: center; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; min-width: 120px; }
        .score-value { font-size: 24px; font-weight: bold; color: #005DAA; }
        .score-label { font-size: 12px; color: #666; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section-title { color: #005DAA; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .question { margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #005DAA; }
        .question-text { font-weight: bold; margin-bottom: 5px; }
        .answer { color: #555; }
        .recommendations { margin-top: 30px; }
        .rec-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        @media print { body { margin: 20px; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${data.questionnaire?.title || 'AI Maturity Assessment'}</div>
        <div class="subtitle">Assessment Report - Generated ${new Date(data.exportedAt).toLocaleDateString()}</div>
        <div class="subtitle">Respondent: ${data.response.respondentName || data.response.respondentEmail}</div>
    </div>

    <div class="summary">
        <h2>Assessment Summary</h2>
        <div class="score-card">
            <div class="score-value">${data.maturityScores.overall.percentage}%</div>
            <div class="score-label">Overall Score</div>
        </div>
        <div class="score-card">
            <div class="score-value">${data.maturityScores.overall.maturityLevel}</div>
            <div class="score-label">Maturity Level</div>
        </div>
        <div class="score-card">
            <div class="score-value">${data.maturityScores.overall.totalResponses}</div>
            <div class="score-label">Responses</div>
        </div>
    </div>

    <div class="sections">
        ${Object.entries(data.maturityScores.sections).map(([sectionId, section]: [string, any]) => `
            <div class="section">
                <div class="section-title">${section.sectionTitle} - ${section.percentage}% (${section.maturityLevel})</div>
                ${data.answers
                  .filter(({ section: s }: any) => s.id === sectionId)
                  .map(({ question, answer }: any) => `
                    <div class="question">
                        <div class="question-text">${question.questionText}</div>
                        <div class="answer">Answer: ${answer.answerValue} ${answer.score ? `(Score: ${answer.score})` : ''}</div>
                    </div>
                  `).join('')}
            </div>
        `).join('')}
    </div>

    ${data.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>Recommended Use Cases</h2>
        ${data.recommendations.map((useCase: any) => `
            <div class="rec-item">
                <strong>${useCase.title}</strong><br>
                <small>${useCase.description}</small>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="no-print" style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        To save as PDF: Use your browser's Print function and select "Save as PDF"
    </div>
</body>
</html>
  `;
}

export default router;