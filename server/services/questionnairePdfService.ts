import PDFDocument from 'pdfkit';
import { db } from '../db';
import { questionnaires, questions, questionnaireResponses, questionAnswers, questionnaireSubsections, questionnaireSections } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';

export class QuestionnairePdfService {
  /**
   * Create executive-style cover page for questionnaire documents
   */
  private static addExecutiveCoverPage(doc: any, title: string, isBlank: boolean = false): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Clean white background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFFFFF');
    
    // Top header with RSA branding
    doc.rect(0, 0, pageWidth, 3).fill('#005DAA');
    
    // RSA Logo and branding (top left)
    doc.fontSize(28)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('RSA', 60, 60);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text('INSURANCE', 60, 95);
    
    // Document classification (top right)
    doc.fontSize(9)
       .fillColor('#999999')
       .font('Helvetica')
       .text('CONFIDENTIAL', pageWidth - 120, 60);
    
    doc.fontSize(8)
       .fillColor('#999999')
       .text('For Internal Use Only', pageWidth - 120, 75);
    
    // Main title (centered, large)
    doc.fontSize(36)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text(title, 0, 200, { align: 'center', width: pageWidth });
    
    const subtitleText = isBlank ? 'Assessment Template' : 'Completed Assessment';
    doc.fontSize(24)
       .fillColor('#005DAA')
       .font('Helvetica')
       .text(subtitleText, 0, 250, { align: 'center', width: pageWidth });
    
    // Executive summary box
    const boxY = 320;
    doc.rect(80, boxY, pageWidth - 160, 120)
       .stroke('#E5E5E5')
       .strokeColor('#E5E5E5');
    
    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('Document Overview', 100, boxY + 20);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Document Type: ${isBlank ? 'Blank Template' : 'Completed Assessment'}`, 100, boxY + 45)
       .text(`Organization: RSA Insurance`, 100, boxY + 60)
       .text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 100, boxY + 75)
       .text(`Classification: Strategic Assessment Document`, 100, boxY + 90);
    
    // Bottom section with instructions
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Instructions', 60, 500);
    
    const instructionText = isBlank 
      ? 'This document contains the complete AI Maturity Assessment questionnaire. Please review each'
      : 'This document contains the completed assessment responses. All answers have been recorded';
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica')
       .text(instructionText, 60, 525, { width: 480, lineGap: 4 })
       .text('section carefully and provide thoughtful, accurate responses that reflect your organization\'s', 60, 545, { width: 480, lineGap: 4 })
       .text('current state and strategic objectives.', 60, 565, { width: 480, lineGap: 4 });
    
    // Footer with page indicator
    doc.fontSize(8)
       .fillColor('#999999')
       .text('RSA Digital Innovation | AI Maturity Assessment', 60, pageHeight - 40)
       .text('Page 1', pageWidth - 80, pageHeight - 40);
  }

  /**
   * Add professional page header
   */
  private static addPageHeader(doc: any, title: string, pageNum: number): void {
    const pageWidth = doc.page.width;
    
    // Top blue line
    doc.rect(0, 0, pageWidth, 2).fill('#005DAA');
    
    // Header content
    doc.fontSize(10)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('RSA Insurance', 60, 25);
    
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica')
       .text(title, 60, 40);
    
    // Page number
    doc.fontSize(9)
       .fillColor('#999999')
       .text(`${pageNum}`, pageWidth - 60, 40);
    
    // Separator line
    doc.moveTo(60, 55)
       .lineTo(pageWidth - 60, 55)
       .stroke('#E5E5E5');
  }

  /**
   * Add section header
   */
  private static addSectionHeader(doc: any, title: string, questionNumber?: number): void {
    if (doc.y > 720) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    doc.moveDown(1);
    
    const headerText = questionNumber ? `${questionNumber}. ${title}` : title;
    
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(headerText);
    
    doc.moveDown(0.5);
    
    // Add underline
    const textWidth = doc.widthOfString(headerText);
    doc.moveTo(doc.x, doc.y - 5)
       .lineTo(doc.x + textWidth, doc.y - 5)
       .stroke('#005DAA');
  }

  /**
   * Add question with response area
   */
  private static addQuestion(doc: any, question: any, response?: any, questionNumber?: number): void {
    if (doc.y > 680) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    doc.moveDown(1);
    
    // Question number and text
    const questionText = questionNumber ? `Q${questionNumber}: ${question.questionText}` : question.questionText;
    
    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(questionText, { width: 480, lineGap: 4 });
    
    doc.moveDown(0.5);
    
    // Question description if available
    if (question.helpText) {
      doc.fontSize(10)
         .fillColor('#666666')
         .font('Helvetica')
         .text(question.helpText, { width: 480, lineGap: 3 });
      
      doc.moveDown(0.5);
    }
    
    // Response area
    const responseY = doc.y;
    const responseHeight = 60;
    
    // Response box
    doc.rect(60, responseY, 480, responseHeight)
       .stroke('#E5E5E5');
    
    if (response && response.answerValue) {
      // Show populated response
      doc.fontSize(10)
         .fillColor('#333333')
         .font('Helvetica')
         .text(response.answerValue, 70, responseY + 10, { width: 460, height: 40, ellipsis: true });
    } else {
      // Show blank response area
      doc.fontSize(9)
         .fillColor('#999999')
         .font('Helvetica-Oblique')
         .text('Response area - Please provide your answer here', 70, responseY + 10);
      
      // Add lines for writing
      for (let i = 0; i < 3; i++) {
        doc.moveTo(70, responseY + 25 + (i * 12))
           .lineTo(530, responseY + 25 + (i * 12))
           .stroke('#F0F0F0');
      }
    }
    
    doc.y = responseY + responseHeight + 10;
  }

  /**
   * Add professional footer
   */
  private static addPageFooter(doc: any): void {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    
    // Footer separator
    doc.moveTo(60, pageHeight - 50)
       .lineTo(pageWidth - 60, pageHeight - 50)
       .stroke('#E5E5E5');
    
    // Footer content
    doc.fontSize(8)
       .fillColor('#666666')
       .font('Helvetica')
       .text('RSA Digital Innovation | AI Use Case Value Framework', 60, pageHeight - 35);
    
    doc.fontSize(8)
       .fillColor('#999999')
       .text(`Generated ${format(new Date(), 'MMM d, yyyy')}`, pageWidth - 150, pageHeight - 35);
  }

  /**
   * Generate blank questionnaire template
   */
  static async generateBlankQuestionnaire(questionnaireId: string, res: Response): Promise<void> {
    try {
      console.log('Generating blank questionnaire template for:', questionnaireId);
      
      // Fetch questionnaire with questions and subsections
      const [questionnaireData] = await db
        .select()
        .from(questionnaires)
        .where(eq(questionnaires.id, questionnaireId));

      if (!questionnaireData) {
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      // Fetch all questions and subsections through sections
      const questionsData = await db
        .select()
        .from(questions)
        .leftJoin(questionnaireSubsections, eq(questions.subsectionId, questionnaireSubsections.id))
        .leftJoin(questionnaireSections, eq(questions.sectionId, questionnaireSections.id))
        .where(eq(questionnaireSections.questionnaireId, questionnaireId))
        .orderBy(questions.questionOrder);

      console.log('Found questions:', questionsData.length);
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Assessment_Template_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      // Stream PDF to response
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, questionnaireData.title || 'AI Maturity Assessment', true);
      
      // PAGE 2: Start questions
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment Template', 2);
      doc.y = 80;
      
      let currentSubsection = '';
      let questionCounter = 1;
      
      questionsData.forEach((item) => {
        const question = item.questions;
        const subsection = item.questionnaire_subsections;
        
        // Add subsection header if changed
        if (subsection && subsection.title !== currentSubsection) {
          this.addSectionHeader(doc, subsection.title);
          currentSubsection = subsection.title;
        }
        
        // Add question
        this.addQuestion(doc, question, null, questionCounter);
        questionCounter++;
      });

      // Add footer to final page
      this.addPageFooter(doc);

      // End the document
      doc.end();
      console.log('Blank questionnaire template generated successfully');

    } catch (error) {
      console.error('Failed to generate blank questionnaire:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate questionnaire template' });
      }
    }
  }

  /**
   * Generate populated questionnaire with responses
   */
  static async generatePopulatedQuestionnaire(responseId: string, res: Response): Promise<void> {
    try {
      console.log('Generating populated questionnaire for response:', responseId);
      
      // Fetch questionnaire response with questions and answers
      const [responseData] = await db
        .select()
        .from(questionnaireResponses)
        .leftJoin(questionnaires, eq(questionnaireResponses.questionnaire_id, questionnaires.id))
        .where(eq(questionnaireResponses.id, responseId));

      if (!responseData) {
        return res.status(404).json({ error: 'Assessment response not found' });
      }

      // Fetch all questions with responses through sections
      const questionsData = await db
        .select()
        .from(questions)
        .leftJoin(questionnaireSubsections, eq(questions.subsectionId, questionnaireSubsections.id))
        .leftJoin(questionnaireSections, eq(questions.sectionId, questionnaireSections.id))
        .leftJoin(questionAnswers, and(
          eq(questionAnswers.questionId, questions.id),
          eq(questionAnswers.responseId, responseId)
        ))
        .where(eq(questionnaireSections.questionnaireId, responseData.questionnaire_responses.questionnaire_id))
        .orderBy(questions.questionOrder);

      console.log('Found questions with responses:', questionsData.length);
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Assessment_Responses_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      // Stream PDF to response
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, responseData.questionnaires?.title || 'AI Maturity Assessment', false);
      
      // PAGE 2: Start questions with responses
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment - Completed', 2);
      doc.y = 80;
      
      // Add respondent information
      doc.fontSize(14)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Assessment Information');
      
      doc.moveDown(0.5);
      
      const infoY = doc.y;
      doc.rect(60, infoY, 480, 60)
         .fill('#F8F9FA')
         .stroke('#E5E5E5');
      
      doc.fontSize(10)
         .fillColor('#333333')
         .font('Helvetica')
         .text(`Respondent: ${responseData.questionnaire_responses.respondent_name || 'Anonymous'}`, 80, infoY + 15)
         .text(`Email: ${responseData.questionnaire_responses.respondent_email || 'Not provided'}`, 80, infoY + 30)
         .text(`Completed: ${responseData.questionnaire_responses.completed_at ? format(new Date(responseData.questionnaire_responses.completed_at), 'MMMM d, yyyy') : 'Recently'}`, 80, infoY + 45);
      
      doc.y = infoY + 80;
      
      let currentSubsection = '';
      let questionCounter = 1;
      
      questionsData.forEach((item) => {
        const question = item.questions;
        const subsection = item.questionnaire_subsections;
        const response = item.question_answers;
        
        // Add subsection header if changed
        if (subsection && subsection.title !== currentSubsection) {
          this.addSectionHeader(doc, subsection.title);
          currentSubsection = subsection.title;
        }
        
        // Add question with response
        this.addQuestion(doc, question, response, questionCounter);
        questionCounter++;
      });

      // Add footer to final page
      this.addPageFooter(doc);

      // End the document
      doc.end();
      console.log('Populated questionnaire generated successfully');

    } catch (error) {
      console.error('Failed to generate populated questionnaire:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate questionnaire responses' });
      }
    }
  }
}