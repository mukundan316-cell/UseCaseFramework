import PDFDocument from 'pdfkit';

interface QuestionData {
  id: string;
  questionText: string;
  questionType: string;
  answerValue?: string;
  answerData?: any;
  options?: any[];
  sectionTitle?: string;
  subsectionTitle?: string;
}

export class EnhancedQuestionRenderer {
  private doc: PDFKit.PDFDocument;
  private margins = { top: 80, bottom: 80, left: 60, right: 60 };
  private pageWidth = 595.28; // A4 width
  private usableWidth: number;
  private currentY: number;

  constructor(doc: PDFKit.PDFDocument) {
    this.doc = doc;
    this.usableWidth = this.pageWidth - this.margins.left - this.margins.right;
    this.currentY = this.margins.top;
  }

  renderQuestion(question: QuestionData, sectionNumber: number, questionNumber: number): void {
    this.checkPageBreak(120);

    // Get complete question text (fixes truncation issues)
    const completeText = this.getCompleteQuestionText(question.questionText, question.id);

    // Render question header
    this.renderQuestionHeader(completeText, sectionNumber, questionNumber);

    // Parse and render answer based on question type
    const answerValue = this.parseAnswerValue(question.answerValue);
    this.renderAnswerByType(answerValue, question.questionType, question.answerData);

    this.currentY += 20; // Space after question
  }

  private renderQuestionHeader(questionText: string, sectionNumber: number, questionNumber: number): void {
    // Question number with RSA styling
    this.doc
      .fillColor('#005DAA')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`${sectionNumber}.${questionNumber}`, this.margins.left, this.currentY);

    // Question text with proper wrapping
    const questionLines = this.wrapText(questionText, this.usableWidth - 60);
    this.doc
      .fillColor('#333333')
      .fontSize(11)
      .font('Helvetica-Bold');

    questionLines.forEach((line, index) => {
      this.doc.text(line, this.margins.left + 40, this.currentY + (index * 15));
    });

    this.currentY += Math.max(25, questionLines.length * 15 + 10);
  }

  private renderAnswerByType(answerValue: any, questionType: string, answerData?: any): void {
    if (!answerValue && !answerData) {
      this.renderResponseArea();
      return;
    }

    // Use structured answerData if available (from our enhanced serialization)
    const dataToRender = answerData?.value || answerValue;

    switch (questionType) {
      case 'company_profile':
        this.renderCompanyProfileData(dataToRender);
        break;
      case 'business_lines_matrix':
        this.renderMatrixData(dataToRender);
        break;
      case 'smart_rating':
        this.renderSmartRatingData(dataToRender);
        break;
      case 'multi_rating':
        this.renderMultiRatingData(dataToRender);
        break;
      case 'percentage_allocation':
      case 'percentage_target':
        this.renderPercentageData(dataToRender);
        break;
      case 'ranking':
        this.renderRankingData(dataToRender);
        break;
      case 'currency':
        this.renderCurrencyData(dataToRender);
        break;
      case 'department_skills_matrix':
        this.renderDepartmentSkillsData(dataToRender);
        break;
      case 'business_performance':
        this.renderBusinessPerformanceData(dataToRender);
        break;
      case 'composite':
        this.renderCompositeData(dataToRender);
        break;
      case 'dynamic_use_case_selector':
        this.renderUseCaseSelectorData(dataToRender);
        break;
      case 'multi_select':
        this.renderMultiSelectData(dataToRender);
        break;
      case 'text_area':
        this.renderTextAreaData(dataToRender);
        break;
      default:
        this.renderGenericAnswer(dataToRender);
    }
  }

  private renderCompanyProfileData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Company Profile:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    if (data.companyName) {
      this.renderFieldValue('Company Name', data.companyName);
    }

    if (data.gwp && typeof data.gwp === 'object') {
      this.renderFieldValue('Gross Written Premium', `${data.gwp.currency || ''} ${data.gwp.amount || 'N/A'}`);
    }

    if (data.employeeCount) {
      this.renderFieldValue('Employee Count', data.employeeCount.toString());
    }

    if (data.businessLines && Array.isArray(data.businessLines)) {
      this.doc
        .fillColor('#666666')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Business Lines:', this.margins.left + 30, this.currentY);
      this.currentY += 15;

      data.businessLines.forEach((line: string, index: number) => {
        this.doc
          .fillColor('#333333')
          .fontSize(9)
          .font('Helvetica')
          .text(`• ${line}`, this.margins.left + 40, this.currentY);
        this.currentY += 12;
      });
    }
  }

  private renderMatrixData(data: any): void {
    if (!data || !Array.isArray(data)) {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Business Lines Matrix:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    // Table headers
    this.doc
      .fillColor('#333333')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Business Line', this.margins.left + 30, this.currentY)
      .text('Premium %', this.margins.left + 200, this.currentY)
      .text('Growth Trend', this.margins.left + 300, this.currentY);
    this.currentY += 15;

    // Draw header line
    this.doc
      .moveTo(this.margins.left + 30, this.currentY)
      .lineTo(this.margins.left + 400, this.currentY)
      .stroke('#CCCCCC');
    this.currentY += 10;

    // Render each business line
    data.forEach((item: any) => {
      if (item && typeof item === 'object') {
        this.renderTableRow(
          item.line || 'Unknown',
          `${item.premium || 0}%`,
          item.trend || 'N/A'
        );
      }
    });
  }

  private renderSmartRatingData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Rating Assessment:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    if (data.rating !== undefined) {
      this.renderFieldValue('Rating', `${data.rating}/5`);
      this.renderRatingScale();
    }

    if (data.rationale) {
      this.renderFieldValue('Rationale', data.rationale);
    }

    if (data.confidence !== undefined) {
      this.renderFieldValue('Confidence Level', `${data.confidence}%`);
    }
  }

  private renderMultiRatingData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Multi-Category Rating:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    Object.entries(data).forEach(([category, rating]) => {
      this.renderFieldValue(this.formatFieldLabel(category), `${rating}/5`);
    });
  }

  private renderPercentageData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Percentage Allocation:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    Object.entries(data).forEach(([category, percentage]) => {
      this.renderFieldValue(this.formatFieldLabel(category), `${percentage}%`);
    });

    // Show total if it's an allocation
    const total = Object.values(data).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    if (total > 0) {
      this.renderFieldValue('Total', `${total}%`);
    }
  }

  private renderRankingData(data: any): void {
    if (!data || !Array.isArray(data)) {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Priority Ranking:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    data.forEach((item, index) => {
      this.doc
        .fillColor('#333333')
        .fontSize(9)
        .font('Helvetica')
        .text(`${index + 1}. ${item}`, this.margins.left + 30, this.currentY);
      this.currentY += 15;
    });
  }

  private renderCurrencyData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.renderFieldValue('Amount', `${data.currency || ''} ${data.amount || 'N/A'}`);
  }

  private renderDepartmentSkillsData(data: any): void {
    if (!data || !Array.isArray(data)) {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Department Skills Matrix:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    data.forEach((dept: any) => {
      if (dept && typeof dept === 'object') {
        this.renderFieldValue('Department', dept.department || 'Unknown');
        this.renderFieldValue('Current Level', `${dept.currentLevel || 'N/A'}/5`);
        this.renderFieldValue('Target Level', `${dept.targetLevel || 'N/A'}/5`);
        this.currentY += 10; // Extra space between departments
      }
    });
  }

  private renderBusinessPerformanceData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Business Performance Metrics:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    Object.entries(data).forEach(([metric, value]) => {
      this.renderFieldValue(this.formatFieldLabel(metric), String(value));
    });
  }

  private renderCompositeData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Composite Assessment:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    if (data.rating !== undefined) {
      this.renderFieldValue('Overall Rating', `${data.rating}/5`);
    }

    if (data.feedback) {
      this.renderFieldValue('Feedback', data.feedback);
    }

    if (data.components && typeof data.components === 'object') {
      this.doc
        .fillColor('#666666')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Component Ratings:', this.margins.left + 30, this.currentY);
      this.currentY += 15;

      Object.entries(data.components).forEach(([component, rating]) => {
        this.renderFieldValue(this.formatFieldLabel(component), `${rating}/5`);
      });
    }
  }

  private renderUseCaseSelectorData(data: any): void {
    if (!data || !Array.isArray(data)) {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Selected Use Cases:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    data.forEach((useCase, index) => {
      this.doc
        .fillColor('#333333')
        .fontSize(9)
        .font('Helvetica')
        .text(`• ${useCase.title || useCase}`, this.margins.left + 30, this.currentY);
      this.currentY += 15;
    });
  }

  private renderMultiSelectData(data: any): void {
    if (!data || !Array.isArray(data)) {
      this.renderGenericAnswer(data);
      return;
    }

    this.doc
      .fillColor('#005DAA')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Selected Options:', this.margins.left + 20, this.currentY);
    this.currentY += 20;

    data.forEach((option) => {
      this.doc
        .fillColor('#333333')
        .fontSize(9)
        .font('Helvetica')
        .text(`• ${option}`, this.margins.left + 30, this.currentY);
      this.currentY += 15;
    });
  }

  private renderTextAreaData(data: any): void {
    const text = String(data || '');
    if (!text.trim()) {
      this.renderResponseArea();
      return;
    }

    const lines = this.wrapText(text, this.usableWidth - 60);
    this.doc
      .fillColor('#333333')
      .fontSize(10)
      .font('Helvetica');

    lines.forEach((line) => {
      this.doc.text(line, this.margins.left + 30, this.currentY);
      this.currentY += 15;
    });
  }

  private renderGenericAnswer(data: any): void {
    if (data === null || data === undefined || data === '') {
      this.renderResponseArea();
      return;
    }

    if (typeof data === 'object') {
      this.renderGenericJSON(data);
    } else {
      const text = String(data);
      const lines = this.wrapText(text, this.usableWidth - 60);
      this.doc
        .fillColor('#333333')
        .fontSize(10)
        .font('Helvetica');

      lines.forEach((line) => {
        this.doc.text(line, this.margins.left + 30, this.currentY);
        this.currentY += 15;
      });
    }
  }

  private renderGenericJSON(data: any): void {
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        this.doc
          .fillColor('#333333')
          .fontSize(9)
          .font('Helvetica')
          .text(`${index + 1}. ${this.formatValue(item)}`, this.margins.left + 30, this.currentY);
        this.currentY += 15;
      });
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        this.renderFieldValue(this.formatFieldLabel(key), this.formatValue(value));
      });
    }
  }

  private getCompleteQuestionText(questionText: string, questionId?: string): string {
    // Map of truncated questions to full text
    const questionMap: Record<string, string> = {
      'Q3: How': 'Q3: How would you describe your current business performance and key metrics?',
      'Q7: Wha': 'Q7: What are your main strategic objectives for implementing AI?',
      'Q11: Wh': 'Q11: What specific AI use cases are you prioritizing for implementation?',
      'Q14: How': 'Q14: How do you assess your competitive positioning in digital transformation?',
      'How do you differentiate': 'How do you differentiate yourself in the insurance market compared to competitors?',
      'How aware are you': 'How aware are you of AI initiatives by your competitors and industry leaders?',
      'What\'s your budget': 'What\'s your budget and timeline for AI investments over the next 2-3 years?',
      'Where will you focus': 'Where will you focus your AI investment priorities across different business areas?',
    };

    // Check for partial matches
    for (const [partial, full] of Object.entries(questionMap)) {
      if (questionText.includes(partial)) {
        return full;
      }
    }

    return questionText;
  }

  // Utility methods
  private parseAnswerValue(answerValue?: string): any {
    if (!answerValue) return null;
    
    try {
      return JSON.parse(answerValue);
    } catch {
      return answerValue;
    }
  }

  private renderFieldValue(label: string, value: string): void {
    this.doc
      .fillColor('#666666')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`${label}:`, this.margins.left + 30, this.currentY);
    
    this.doc
      .fillColor('#333333')
      .fontSize(9)
      .font('Helvetica')
      .text(value, this.margins.left + 120, this.currentY, {
        width: this.usableWidth - 140
      });
    
    this.currentY += 15;
  }

  private renderTableRow(label: string, value: string, extraValue?: string): void {
    // Three-column layout for matrix data
    this.doc
      .fillColor('#333333')
      .fontSize(9)
      .font('Helvetica')
      .text(label, this.margins.left + 30, this.currentY, {
        width: 150
      })
      .text(value, this.margins.left + 200, this.currentY, {
        width: 80,
        align: 'center'
      });
    
    if (extraValue) {
      this.doc.text(extraValue, this.margins.left + 300, this.currentY, {
        width: 100,
        align: 'center'
      });
    }
    
    this.currentY += 15;
  }

  private renderRatingScale(): void {
    // Draw rating scale 1-5
    this.doc
      .fillColor('#666666')
      .fontSize(9)
      .font('Helvetica')
      .text('Rating Scale: 1 (Poor) → 5 (Excellent)', this.margins.left + 20, this.currentY);
    
    this.currentY += 15;

    // Draw scale circles
    for (let i = 1; i <= 5; i++) {
      const x = this.margins.left + 30 + (i - 1) * 40;
      this.doc
        .circle(x, this.currentY + 5, 8)
        .stroke('#005DAA')
        .fillColor('#333333')
        .fontSize(8)
        .text(i.toString(), x - 3, this.currentY + 2);
    }
    
    this.currentY += 25;
  }

  private renderResponseArea(): void {
    // Draw response box for blank questions
    this.doc
      .rect(this.margins.left + 20, this.currentY, this.usableWidth - 40, 40)
      .stroke('#CCCCCC');
    
    this.doc
      .fillColor('#999999')
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text('Response Area', this.margins.left + 30, this.currentY + 15);
    
    this.currentY += 50;
  }

  private formatFieldLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  private formatValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const width = this.doc.widthOfString(testLine);
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageWidth - this.margins.bottom) {
      this.doc.addPage();
      this.currentY = this.margins.top;
      
      // Add RSA header to new page
      this.doc
        .fillColor('#005DAA')
        .rect(0, 0, this.pageWidth, 40)
        .fill()
        .fillColor('white')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('RSA Insurance - AI Maturity Assessment', 60, 15);
      
      this.currentY = 60;
    }
  }
}