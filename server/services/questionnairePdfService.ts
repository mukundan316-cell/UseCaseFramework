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
   * Add main section header
   */
  private static addSectionHeader(doc: any, title: string, sectionNumber?: string): void {
    // Add page if close to bottom with better space calculation
    if (doc.y > 680) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    // More generous spacing before section
    if (doc.y > 80) {
      doc.moveDown(1.5);
    }
    
    // Section background box
    const boxY = doc.y;
    doc.rect(60, boxY, 480, 35)
       .fill('#005DAA')
       .stroke('#005DAA');
    
    const headerText = sectionNumber ? `SECTION ${sectionNumber}: ${title.toUpperCase()}` : title.toUpperCase();
    
    doc.fontSize(12)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text(headerText, 80, boxY + 12);
    
    doc.y = boxY + 45;
    doc.moveDown(0.8);
  }

  /**
   * Add subsection header
   */
  private static addSubsectionHeader(doc: any, title: string): void {
    // Add page if close to bottom with better space calculation
    if (doc.y > 700) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    // Better spacing before subsection
    if (doc.y > 80) {
      doc.moveDown(1.0);
    }
    
    doc.fontSize(11)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(title);
    
    // Add underline
    const textWidth = doc.widthOfString(title);
    doc.moveTo(doc.x, doc.y + 2)
       .lineTo(doc.x + textWidth, doc.y + 2)
       .stroke('#005DAA');
    
    doc.moveDown(0.7);
  }

  /**
   * Add question with response area
   */
  private static addQuestion(doc: any, question: any, response?: any, questionNumber?: number): void {
    // Check if we have enough space for question + response (approx 120px)
    if (doc.y > 680) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    doc.moveDown(0.8);
    
    // Question number and text with better formatting
    const questionText = questionNumber ? `Q${questionNumber}: ${question.questionText}` : question.questionText;
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(questionText, { width: 480, lineGap: 5 });
    
    doc.moveDown(0.3);
    
    // Question description if available
    if (question.helpText) {
      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Oblique')
         .text(question.helpText, { width: 480, lineGap: 3 });
      
      doc.moveDown(0.5);
    }
    
    // Question type indicator
    if (question.questionType) {
      doc.fontSize(8)
         .fillColor('#999999')
         .font('Helvetica')
         .text(`Type: ${question.questionType}`, { width: 480 });
      
      doc.moveDown(0.3);
    }
    
    // Enhanced response area based on question type
    const responseY = doc.y;
    let responseHeight = 50;
    
    if (response?.answerValue) {
      // Show actual response with better formatting
      doc.fontSize(10)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Response:', 70, responseY);
      
      // Response background box
      const answerBoxY = responseY + 15;
      const answerText = response.answerValue;
      const answerHeight = Math.max(25, doc.heightOfString(answerText, { width: 450 }) + 10);
      
      doc.rect(70, answerBoxY, 460, answerHeight)
         .fill('#F0F8FF')
         .stroke('#005DAA');
      
      doc.fontSize(10)
         .fillColor('#333333')
         .font('Helvetica')
         .text(answerText, 80, answerBoxY + 8, { width: 440, lineGap: 3 });
         
      responseHeight = answerHeight + 25;
    } else {
      // Enhanced template response area based on question type
      doc.fontSize(9)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Response Area:', 70, responseY);
      
      if (question.questionType === 'select' || question.questionType === 'radio') {
        // Show options for selection questions
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('Please select one of the following options:', 70, responseY + 15);
        
        if (question.options) {
          try {
            const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
            let optionY = responseY + 30;
            
            options.slice(0, 5).forEach((option: any, index: number) => { // Limit to 5 options for space
              doc.fontSize(9)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(`☐ ${option.label || option}`, 80, optionY);
              optionY += 12;
            });
            
            if (options.length > 5) {
              doc.fontSize(8)
                 .fillColor('#999999')
                 .text(`... and ${options.length - 5} more options`, 80, optionY);
            }
            
            responseHeight = Math.max(60, (Math.min(options.length, 5) * 12) + 50);
          } catch (e) {
            // Fallback for malformed options
            responseHeight = 40;
          }
        }
      } else if (question.questionType === 'checkbox') {
        // Show checkbox options
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('Please select all that apply:', 70, responseY + 15);
        responseHeight = 60;
      } else if (question.questionType === 'textarea' || question.questionType === 'text') {
        // Show text input area
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('Please provide your detailed response below:', 70, responseY + 15);
        
        // Add lined writing area
        for (let i = 0; i < 4; i++) {
          doc.moveTo(70, responseY + 35 + (i * 15))
             .lineTo(530, responseY + 35 + (i * 15))
             .stroke('#E0E0E0');
        }
        responseHeight = 85;
      } else {
        // Default response area
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('Please provide your answer here:', 70, responseY + 15);
        
        // Add lines for writing
        for (let i = 0; i < 3; i++) {
          doc.moveTo(70, responseY + 30 + (i * 12))
             .lineTo(530, responseY + 30 + (i * 12))
             .stroke('#F0F0F0');
        }
        responseHeight = 60;
      }
    }
    
    doc.y = responseY + responseHeight + 12;
  }

  /**
   * Enhanced question rendering with form structure
   */
  private static addEnhancedQuestion(doc: any, question: any, response?: any, questionNumber?: number): void {
    // Calculate minimum space needed for question + response
    const estimatedQuestionHeight = Math.max(60, doc.heightOfString(question.questionText, { width: 480 }) + 40);
    const minSpaceNeeded = estimatedQuestionHeight + 100; // Additional buffer for response
    
    // Check if we need a new page with better space calculation
    if (doc.y + minSpaceNeeded > 750) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    // Consistent spacing before each question
    if (doc.y > 80) {
      doc.moveDown(1.2);
    }
    
    // Question number and text with better formatting
    const questionText = questionNumber ? `Q${questionNumber}: ${question.questionText}` : question.questionText;
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(questionText, { width: 480, lineGap: 5 });
    
    doc.moveDown(0.4);
    
    // Question description if available
    if (question.helpText) {
      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Oblique')
         .text(question.helpText, { width: 480, lineGap: 3 });
      
      doc.moveDown(0.6);
    }
    
    // Parse question data for form structure
    let questionData = null;
    if (question.questionData) {
      try {
        questionData = typeof question.questionData === 'string' ? 
          JSON.parse(question.questionData) : question.questionData;
      } catch (e) {
        console.warn('Failed to parse question data:', e);
      }
    }
    
    const responseY = doc.y;
    let responseHeight = 50;
    
    // First try to get structured data from answerData (JSONB), fallback to answerValue
    let displayData = null;
    
    if (response?.answerData) {
      try {
        displayData = typeof response.answerData === 'string' ? 
          JSON.parse(response.answerData) : response.answerData;
      } catch (e) {
        console.warn('Failed to parse answer data:', e);
      }
    }
    
    if (response && (displayData || response.answerValue)) {
      // Show actual response with enhanced formatting for complex types
      doc.fontSize(10)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Response:', 70, responseY);
      
      const answerBoxY = responseY + 15;
      
      // Handle structured data rendering
      if (displayData && displayData.value && typeof displayData.value === 'object') {
        responseHeight = this.renderStructuredResponse(doc, displayData.value, question.questionType, answerBoxY);
      } else {
        // Fallback to simple text response
        const answerText = displayData?.value || response.answerValue || 'No response provided';
        
        // Skip rendering if the answer is corrupted (e.g., "[object Object]")
        if (answerText === '[object Object]' || answerText === '[object Object]') {
          doc.fontSize(10)
             .fillColor('#CC0000')
             .font('Helvetica-Oblique')
             .text('(Response data formatting issue - contact support)', 80, answerBoxY + 8);
          responseHeight = 30;
        } else {
          const answerHeight = Math.max(25, doc.heightOfString(answerText, { width: 450 }) + 10);
          
          doc.rect(70, answerBoxY, 460, answerHeight)
             .fill('#F0F8FF')
             .stroke('#005DAA');
          
          doc.fontSize(10)
             .fillColor('#333333')
             .font('Helvetica')
             .text(answerText, 80, answerBoxY + 8, { width: 440, lineGap: 3 });
             
          responseHeight = answerHeight + 25;
        }
      }
    } else {
      // Render based on specific question type and data structure
      responseHeight = this.renderQuestionFormElements(doc, question, questionData, responseY);
    }
    
    doc.y = responseY + responseHeight + 15;
  }

  /**
   * Render form elements based on question type and data
   */
  private static renderQuestionFormElements(doc: any, question: any, questionData: any, startY: number): number {
    const questionType = question.questionType;
    let currentY = startY;
    let totalHeight = 0;
    
    // Company Profile - special structured form
    if (questionType === 'company_profile' && questionData?.fields) {
      doc.fontSize(10)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Please complete the following company information:', 70, currentY);
      
      currentY += 20;
      
      questionData.fields.forEach((field: any) => {
        this.renderFormField(doc, field, currentY);
        currentY += this.getFieldHeight(field);
      });
      
      totalHeight = currentY - startY + 10;
      
    // Business Lines Matrix - structured form
    } else if (questionType === 'business_lines_matrix' && questionData?.businessLines) {
      doc.fontSize(10)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Premium Distribution by Business Line:', 70, currentY);
      
      currentY += 20;
      
      // Table header
      doc.fontSize(9)
         .fillColor('#333333')
         .font('Helvetica-Bold')
         .text('Business Line', 80, currentY)
         .text('Percentage (%)', 350, currentY);
      
      currentY += 15;
      
      // Draw header underline
      doc.moveTo(80, currentY)
         .lineTo(480, currentY)
         .stroke('#CCCCCC');
      
      currentY += 10;
      
      // Business line rows
      if (questionData.businessLines) {
        questionData.businessLines.forEach((line: any) => {
          doc.fontSize(9)
             .fillColor('#333333')
             .font('Helvetica')
             .text(line.label || line, 80, currentY);
          
          // Draw input box for percentage
          doc.rect(350, currentY - 3, 80, 15)
             .stroke('#CCCCCC');
          
          doc.fontSize(8)
             .fillColor('#999999')
             .text('___%', 355, currentY + 1);
          
          currentY += 20;
        });
      }
      
      totalHeight = currentY - startY + 10;
      
    // Percentage Target - slider-like display
    } else if (questionType === 'percentage_target' && questionData?.targets) {
      doc.fontSize(10)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Target Allocation Distribution:', 70, currentY);
      
      currentY += 20;
      
      questionData.targets.forEach((target: any) => {
        doc.fontSize(9)
           .fillColor('#333333')
           .font('Helvetica')
           .text(`${target.label}:`, 80, currentY);
        
        // Visual slider representation
        const sliderY = currentY + 3;
        const sliderWidth = 200;
        
        // Slider track
        doc.rect(250, sliderY, sliderWidth, 8)
           .fill('#F0F0F0')
           .stroke('#CCCCCC');
        
        // Slider handle (placeholder position)
        doc.circle(250 + (sliderWidth * 0.3), sliderY + 4, 6)
           .fill('#005DAA')
           .stroke('#003D75');
        
        // Percentage display
        doc.fontSize(8)
           .fillColor('#666666')
           .text('___%', 460, currentY);
        
        currentY += 25;
      });
      
      totalHeight = currentY - startY + 10;
      
    // Default form elements
    } else {
      doc.fontSize(10)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Response Area:', 70, currentY);
      
      currentY += 20;
      
      // Render based on question type
      if (questionType === 'textarea') {
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('Please provide your detailed response:', 80, currentY);
        
        currentY += 15;
        
        // Text area representation
        doc.rect(80, currentY, 400, 60)
           .stroke('#CCCCCC');
        
        // Lined writing area
        for (let i = 1; i < 4; i++) {
          doc.moveTo(85, currentY + (i * 15))
             .lineTo(475, currentY + (i * 15))
             .stroke('#E0E0E0');
        }
        
        totalHeight = 100;
        
      } else {
        // Default text input
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('Please provide your answer:', 80, currentY);
        
        currentY += 15;
        
        // Input field representation
        doc.rect(80, currentY, 300, 20)
           .stroke('#CCCCCC');
        
        totalHeight = 50;
      }
    }
    
    return totalHeight;
  }

  /**
   * Render individual form field
   */
  private static renderFormField(doc: any, field: any, startY: number): void {
    doc.fontSize(9)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(`${field.label}${field.required ? ' *' : ''}:`, 80, startY);
    
    const fieldY = startY + 15;
    
    switch (field.type) {
      case 'text':
        // Text input box
        doc.rect(80, fieldY, 250, 20)
           .stroke('#CCCCCC');
        
        if (field.placeholder) {
          doc.fontSize(8)
             .fillColor('#999999')
             .text(field.placeholder, 85, fieldY + 6);
        }
        break;
        
      case 'currency':
        // Currency input with symbol
        doc.fontSize(8)
           .fillColor('#666666')
           .text(field.currency || 'GBP', 80, fieldY + 6);
        
        doc.rect(110, fieldY, 150, 20)
           .stroke('#CCCCCC');
        
        if (field.placeholder) {
          doc.fontSize(8)
             .fillColor('#999999')
             .text(field.placeholder, 115, fieldY + 6);
        }
        break;
        
      case 'select':
        // Dropdown representation
        doc.rect(80, fieldY, 200, 20)
           .stroke('#CCCCCC');
        
        doc.fontSize(8)
           .fillColor('#999999')
           .text('▼ Select...', 85, fieldY + 6);
        
        // Show options if available
        if (field.options && field.options.length > 0) {
          doc.fontSize(7)
             .fillColor('#888888')
             .text(`Options: ${field.options.map((opt: any) => opt.label).join(', ')}`, 285, fieldY + 6);
        }
        break;
        
      case 'multiselect':
        // Multi-select checkboxes
        if (field.options) {
          field.options.forEach((option: any, index: number) => {
            const checkY = fieldY + (index * 15);
            
            // Checkbox
            doc.rect(80, checkY, 10, 10)
               .stroke('#CCCCCC');
            
            // Option label
            doc.fontSize(8)
               .fillColor('#333333')
               .text(option.label, 95, checkY + 2);
          });
        }
        break;
    }
  }

  /**
   * Calculate height needed for form field
   */
  private static getFieldHeight(field: any): number {
    switch (field.type) {
      case 'multiselect':
        return 30 + (field.options ? field.options.length * 15 : 0);
      default:
        return 45;
    }
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
        res.status(404).json({ error: 'Questionnaire not found' });
        return;
      }

      // Fetch sections, subsections and questions with proper hierarchy
      const sectionsData = await db
        .select()
        .from(questionnaireSections)
        .where(eq(questionnaireSections.questionnaireId, questionnaireId))
        .orderBy(questionnaireSections.sectionOrder);

      const questionsData = await db
        .select()
        .from(questions)
        .leftJoin(questionnaireSubsections, eq(questions.subsectionId, questionnaireSubsections.id))
        .leftJoin(questionnaireSections, eq(questions.sectionId, questionnaireSections.id))
        .where(eq(questionnaireSections.questionnaireId, questionnaireId))
        .orderBy(questionnaireSections.sectionOrder, questionnaireSubsections.subsectionOrder, questions.questionOrder);

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
      
      let currentSection = '';
      let currentSubsection = '';
      let questionCounter = 1;
      
      questionsData.forEach((item) => {
        const question = item.questions;
        const subsection = item.questionnaire_subsections;
        const section = item.questionnaire_sections;
        
        // Add section header if changed
        if (section && section.title !== currentSection) {
          this.addSectionHeader(doc, section.title, section.sectionOrder?.toString());
          currentSection = section.title;
          currentSubsection = ''; // Reset subsection when section changes
        }
        
        // Add subsection header if changed
        if (subsection && subsection.title !== currentSubsection) {
          this.addSubsectionHeader(doc, subsection.title);
          currentSubsection = subsection.title;
        }
        
        // Add question
        this.addEnhancedQuestion(doc, question, null, questionCounter);
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
        .leftJoin(questionnaires, eq(questionnaireResponses.questionnaireId, questionnaires.id))
        .where(eq(questionnaireResponses.id, responseId));

      if (!responseData) {
        res.status(404).json({ error: 'Assessment response not found' });
        return;
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
        .where(eq(questionnaireSections.questionnaireId, responseData.questionnaire_responses.questionnaireId))
        .orderBy(questionnaireSections.sectionOrder, questionnaireSubsections.subsectionOrder, questions.questionOrder);

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
         .text(`Respondent: ${responseData.questionnaire_responses.respondentName || 'Anonymous'}`, 80, infoY + 15)
         .text(`Email: ${responseData.questionnaire_responses.respondentEmail || 'Not provided'}`, 80, infoY + 30)
         .text(`Completed: ${responseData.questionnaire_responses.completedAt ? format(new Date(responseData.questionnaire_responses.completedAt), 'MMMM d, yyyy') : 'Recently'}`, 80, infoY + 45);
      
      doc.y = infoY + 80;
      
      let currentSection = '';
      let currentSubsection = '';
      let questionCounter = 1;
      
      questionsData.forEach((item) => {
        const question = item.questions;
        const subsection = item.questionnaire_subsections;
        const section = item.questionnaire_sections;
        const response = item.question_answers;
        
        // Add section header if changed
        if (section && section.title !== currentSection) {
          this.addSectionHeader(doc, section.title, section.sectionOrder?.toString());
          currentSection = section.title;
          currentSubsection = ''; // Reset subsection when section changes
        }
        
        // Add subsection header if changed
        if (subsection && subsection.title !== currentSubsection) {
          this.addSubsectionHeader(doc, subsection.title);
          currentSubsection = subsection.title;
        }
        
        // Add question with response
        this.addEnhancedQuestion(doc, question, response, questionCounter);
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

  /**
   * Render structured response data for complex question types
   */
  private static renderStructuredResponse(doc: any, data: any, questionType: string, startY: number): number {
    let currentY = startY;
    let totalHeight = 0;
    
    try {
      switch (questionType) {
        case 'company_profile':
          if (data.companyName || data.gwp || data.employees || data.businessType) {
            // Create a clean info box with dynamic height
            const fieldCount = [data.companyName, data.businessType, data.gwp, data.employees].filter(Boolean).length;
            const boxHeight = Math.max(60, 20 + (fieldCount * 18) + 10);
            
            doc.rect(70, currentY, 460, boxHeight)
               .fill('#F0F8FF')
               .stroke('#005DAA');
            
            currentY += 12;
            
            if (data.companyName) {
              doc.fontSize(10)
                 .fillColor('#333333')
                 .font('Helvetica-Bold')
                 .text(`Company: ${data.companyName}`, 80, currentY);
              currentY += 18;
            }
            
            if (data.businessType) {
              doc.fontSize(10)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(`Business Type: ${data.businessType}`, 80, currentY);
              currentY += 18;
            }
            
            if (data.gwp) {
              doc.fontSize(10)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(`GWP: ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(data.gwp)}`, 80, currentY);
              currentY += 18;
            }
            
            if (data.employees) {
              doc.fontSize(10)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(`Employees: ${data.employees.toLocaleString()}`, 80, currentY);
              currentY += 18;
            }
            
            totalHeight = boxHeight + 20;
          }
          break;
          
        case 'business_lines_matrix':
          if (data.businessLines && Array.isArray(data.businessLines)) {
            const boxHeight = 25 + (data.businessLines.length * 18) + 15;
            doc.rect(70, currentY, 460, boxHeight)
               .fill('#F0F8FF')
               .stroke('#005DAA');
            
            currentY += 12;
            
            doc.fontSize(10)
               .fillColor('#333333')
               .font('Helvetica-Bold')
               .text('Business Line Distribution:', 80, currentY);
            currentY += 22;
            
            data.businessLines.forEach((line: any) => {
              const lineText = `• ${line.line || line.name || 'Unknown'}: ${line.premium || 0}%`;
              const trend = line.trend ? ` (${line.trend})` : '';
              
              doc.fontSize(9)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(lineText + trend, 80, currentY);
              currentY += 18;
            });
            
            totalHeight = boxHeight + 20;
          }
          break;
          
        case 'percentage_target':
          if (typeof data === 'object') {
            const entries = Object.entries(data);
            const boxHeight = 25 + (entries.length * 18) + 10;
            doc.rect(70, currentY, 460, boxHeight)
               .fill('#F0F8FF')
               .stroke('#005DAA');
            
            currentY += 12;
            
            doc.fontSize(10)
               .fillColor('#333333')
               .font('Helvetica-Bold')
               .text('Distribution:', 80, currentY);
            currentY += 22;
            
            entries.forEach(([key, value]) => {
              doc.fontSize(9)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(`• ${key}: ${value}%`, 80, currentY);
              currentY += 18;
            });
            
            totalHeight = boxHeight + 20;
          }
          break;
          
        case 'ranking':
          if (Array.isArray(data)) {
            const boxHeight = 25 + (data.length * 18) + 10;
            doc.rect(70, currentY, 460, boxHeight)
               .fill('#F0F8FF')
               .stroke('#005DAA');
            
            currentY += 12;
            
            doc.fontSize(10)
               .fillColor('#333333')
               .font('Helvetica-Bold')
               .text('Ranking:', 80, currentY);
            currentY += 22;
            
            data.sort((a, b) => (a.rank || 0) - (b.rank || 0)).forEach((item: any) => {
              doc.fontSize(9)
                 .fillColor('#333333')
                 .font('Helvetica')
                 .text(`${item.rank}. ${item.label || item.id}`, 80, currentY);
              currentY += 18;
            });
            
            totalHeight = boxHeight + 20;
          }
          break;
          
        case 'smart_rating':
          if (data.value !== undefined) {
            const boxHeight = 45;
            doc.rect(70, currentY, 460, boxHeight)
               .fill('#F0F8FF')
               .stroke('#005DAA');
            
            currentY += 12;
            
            const ratingText = `Rating: ${data.value}/5`;
            const labelText = data.label ? ` (${data.label})` : '';
            
            doc.fontSize(10)
               .fillColor('#333333')
               .font('Helvetica-Bold')
               .text(ratingText + labelText, 80, currentY);
            
            totalHeight = boxHeight + 20;
          }
          break;
          
        default:
          // Default structured display
          const jsonString = JSON.stringify(data, null, 2);
          const boxHeight = Math.max(40, doc.heightOfString(jsonString, { width: 440 }) + 20);
          
          doc.rect(70, currentY, 460, boxHeight)
             .fill('#F0F8FF')
             .stroke('#005DAA');
          
          doc.fontSize(9)
             .fillColor('#333333')
             .font('Courier')
             .text(jsonString, 80, currentY + 10, { width: 440, lineGap: 2 });
          
          totalHeight = boxHeight + 15;
      }
    } catch (error) {
      console.error('Error rendering structured response:', error);
      // Fallback to simple text
      doc.fontSize(10)
         .fillColor('#CC0000')
         .font('Helvetica-Oblique')
         .text('(Unable to display structured response)', 80, currentY);
      totalHeight = 25;
    }
    
    return totalHeight;
  }
}