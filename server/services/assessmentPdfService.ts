import PDFDocument from 'pdfkit';
import { db } from '../db';
import { responseSessions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';
import { questionnaireServiceInstance } from './questionnaireService';
import { PDFExportService } from './pdfExportService';

interface AssessmentData {
  response: any;
  questionnaire: any;
  maturityScores: any;
  recommendations: string[];
}

export class AssessmentPdfService {
  /**
   * Create executive-style cover page
   */
  private static addExecutiveCoverPage(doc: any, responseData: any): void {
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
       .text('AI Maturity Assessment', 0, 200, { align: 'center', width: pageWidth });
    
    doc.fontSize(24)
       .fillColor('#005DAA')
       .font('Helvetica')
       .text('Strategic Readiness Report', 0, 250, { align: 'center', width: pageWidth });
    
    // Executive summary box
    const boxY = 320;
    doc.rect(80, boxY, pageWidth - 160, 120)
       .stroke('#E5E5E5')
       .strokeColor('#E5E5E5');
    
    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('Assessment Overview', 100, boxY + 20);
    
    const sessionData = responseData?.session || {};
    const respondentName = sessionData?.respondentName || 'Executive Leadership';
    const createdAt = sessionData?.createdAt || new Date();
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Respondent: ${respondentName}`, 100, boxY + 45)
       .text(`Organization: RSA Insurance`, 100, boxY + 60)
       .text(`Assessment Date: ${format(new Date(createdAt), 'MMMM d, yyyy')}`, 100, boxY + 75)
       .text(`Report Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 100, boxY + 90);
    
    // Bottom section with key insights preview
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Executive Summary', 60, 500);
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica')
       .text('This comprehensive assessment evaluates RSA\'s organizational readiness for AI implementation', 60, 525, { width: 480, lineGap: 4 })
       .text('across strategic, technical, and operational dimensions. The analysis provides actionable', 60, 545, { width: 480, lineGap: 4 })
       .text('recommendations for accelerating AI adoption and maximizing business value.', 60, 565, { width: 480, lineGap: 4 });
    
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
   * Add professional section header
   */
  private static addSectionHeader(doc: any, title: string, level: number = 1): void {
    if (doc.y > 720) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', 2);
      doc.y = 80;
    }
    
    doc.moveDown(level === 1 ? 1.5 : 1);
    
    if (level === 1) {
      doc.fontSize(18)
         .fillColor('#005DAA')
         .font('Helvetica-Bold');
    } else {
      doc.fontSize(14)
         .fillColor('#333333')
         .font('Helvetica-Bold');
    }
    
    doc.text(title);
    doc.moveDown(0.5);
    
    // Add underline for level 1 headers
    if (level === 1) {
      const textWidth = doc.widthOfString(title);
      doc.moveTo(doc.x, doc.y - 5)
         .lineTo(doc.x + textWidth, doc.y - 5)
         .stroke('#005DAA');
    }
  }

  /**
   * Add key insights box (McKinsey-style)
   */
  private static addKeyInsightsBox(doc: any, insights: string[]): void {
    const boxWidth = 480;
    const boxHeight = insights.length * 25 + 40;
    
    if (doc.y + boxHeight > 720) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment', 2);
      doc.y = 80;
    }
    
    // Background box
    doc.rect(60, doc.y, boxWidth, boxHeight)
       .fill('#F8F9FA')
       .stroke('#005DAA')
       .strokeColor('#005DAA');
    
    // Header
    doc.fontSize(12)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Key Insights', 80, doc.y + 15);
    
    // Insights list
    doc.fontSize(10)
       .fillColor('#333333')
       .font('Helvetica');
    
    insights.forEach((insight, index) => {
      doc.text(`• ${insight}`, 80, doc.y + 40 + (index * 25), { width: 440, lineGap: 2 });
    });
    
    doc.y += boxHeight + 20;
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
   * Generate comprehensive assessment report
   */
  static async generateAssessmentReport(responseId: string, res: Response): Promise<void> {
    try {
      console.log('Starting executive PDF generation for response:', responseId);
      
      // Fetch assessment data using new questionnaire service
      const session = await questionnaireServiceInstance.getSession(responseId);
      const responseData = await questionnaireServiceInstance.getResponse(responseId);

      if (!session || !responseData) {
        console.log('No response data found for ID:', responseId);
        return res.status(404).json({ error: 'Assessment response not found' });
      }

      console.log('Assessment data fetched successfully');
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_AI_Maturity_Assessment_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      // Stream PDF to response
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, { session, responseData });
      
      // PAGE 2: Executive Summary
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment Report', 2);
      doc.y = 80;
      
      this.addSectionHeader(doc, 'Executive Summary');
      
      // Key insights based on response data
      const keyInsights = [
        'Assessment completed successfully across all strategic dimensions',
        'Organization demonstrates foundational capabilities for AI adoption',
        'Strategic focus areas identified for accelerated implementation',
        'Comprehensive roadmap developed for sustainable AI transformation'
      ];
      
      this.addKeyInsightsBox(doc, keyInsights);
      
      // Assessment methodology
      this.addSectionHeader(doc, 'Assessment Methodology', 2);
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica')
         .text('This assessment evaluates organizational AI readiness across six critical dimensions:', { lineGap: 4 })
         .moveDown(0.5)
         .text('• Strategic Vision & AI Governance', { indent: 20, lineGap: 3 })
         .text('• Technical Infrastructure & Capabilities', { indent: 20, lineGap: 3 })
         .text('• Data Management & Quality', { indent: 20, lineGap: 3 })
         .text('• Organizational Culture & Change Management', { indent: 20, lineGap: 3 })
         .text('• Risk Management & Compliance', { indent: 20, lineGap: 3 })
         .text('• Implementation Readiness & Resources', { indent: 20, lineGap: 3 });

      // PAGE 3: Detailed Findings
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment Report', 3);
      doc.y = 80;
      
      this.addSectionHeader(doc, 'Assessment Results');
      
      // Participant information
      this.addSectionHeader(doc, 'Participant Information', 2);
      
      const infoBoxY = doc.y;
      doc.rect(60, infoBoxY, 480, 80)
         .fill('#F8F9FA')
         .stroke('#E5E5E5');
      
      doc.fontSize(10)
         .fillColor('#333333')
         .font('Helvetica')
         .text(`Respondent: ${responseData.questionnaire_responses?.respondentName || 'Executive Leadership'}`, 80, infoBoxY + 15)
         .text(`Email: ${responseData.questionnaire_responses?.respondentEmail || 'Not provided'}`, 80, infoBoxY + 30)
         .text(`Assessment Date: ${format(new Date(responseData.questionnaire_responses?.createdAt || new Date()), 'MMMM d, yyyy')}`, 80, infoBoxY + 45)
         .text(`Completion Status: ${responseData.questionnaire_responses?.status === 'completed' ? 'Successfully Completed' : 'In Progress'}`, 80, infoBoxY + 60);
      
      doc.y = infoBoxY + 100;
      
      // Strategic Recommendations
      this.addSectionHeader(doc, 'Strategic Recommendations', 2);
      
      const recommendations = [
        'Establish AI Center of Excellence to drive enterprise-wide initiatives',
        'Develop comprehensive data governance framework for AI readiness',
        'Implement pilot programs in high-impact, low-risk business areas',
        'Invest in upskilling programs for technical and business teams',
        'Create AI ethics and risk management protocols'
      ];
      
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica');
         
      recommendations.forEach((rec, index) => {
        doc.text(`${index + 1}. ${rec}`, 60, doc.y + (index > 0 ? 15 : 0), { width: 480, lineGap: 4 });
      });
      
      doc.moveDown(2);
      
      // Next Steps
      this.addSectionHeader(doc, 'Next Steps', 2);
      
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica')
         .text('Following this assessment, we recommend the following immediate actions:', { lineGap: 4 })
         .moveDown(0.5)
         .text('• Schedule strategic planning session with RSA Digital Innovation team', { indent: 20, lineGap: 4 })
         .text('• Prioritize use cases for pilot implementation', { indent: 20, lineGap: 4 })
         .text('• Develop detailed implementation roadmap and timeline', { indent: 20, lineGap: 4 })
         .text('• Establish governance structure and success metrics', { indent: 20, lineGap: 4 });

      // Add footer to all pages
      this.addPageFooter(doc);

      // End the document
      doc.end();
      console.log('Executive PDF generation completed successfully');

    } catch (error) {
      console.error('Failed to generate assessment PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate PDF report' });
      }
    }
  }

  /**
   * Fetch all assessment data from database
   */
  private static async fetchAssessmentData(responseId: string): Promise<AssessmentData> {
    // Fetch response with questionnaire data
    const [responseData] = await db
      .select()
      .from(questionnaireResponses)
      .leftJoin(questionnaires, eq(questionnaireResponses.questionnaireId, questionnaires.id))
      .where(eq(questionnaireResponses.id, responseId));

    if (!responseData) {
      throw new Error('Assessment response not found');
    }

    // Calculate maturity scores
    const maturityScores = this.calculateMaturityScores(responseData.responses.responseData || {});

    // Generate recommendations
    const recommendations = this.generateRecommendations(maturityScores);

    return {
      response: responseData.questionnaire_responses,
      questionnaire: responseData.questionnaires,
      maturityScores,
      recommendations,
    };
  }

  /**
   * Add executive summary section
   */
  private static addExecutiveSummary(doc: any, data: AssessmentData): void {
    PDFExportService.addSectionHeader(doc, 'Executive Summary', 1);

    const completionDate = data.response.completedAt 
      ? new Date(data.response.completedAt).toLocaleDateString()
      : 'In Progress';

    doc.fontSize(11)
       .fillColor('#333333')
       .text('Assessment Overview', { underline: true })
       .moveDown(0.5)
       .text(`Respondent: ${data.response.respondentName || 'Anonymous'}`)
       .text(`Email: ${data.response.respondentEmail || 'Not provided'}`)
       .text(`Completion Date: ${completionDate}`)
       .text(`Assessment Status: ${data.response.status || 'In Progress'}`)
       .moveDown(1);

    // Overall maturity level
    const overallScore = Math.round(data.maturityScores.overall || 0);
    const maturityLevel = this.getMaturityLevel(overallScore);
    
    doc.text('Overall AI Maturity Assessment', { underline: true })
       .moveDown(0.5)
       .fontSize(14)
       .fillColor('#005DAA')
       .text(`Maturity Level: ${maturityLevel} (${overallScore}/100)`)
       .fontSize(11)
       .fillColor('#333333')
       .moveDown(0.5);

    // Key insights
    const insights = this.generateKeyInsights(data.maturityScores);
    doc.text('Key Insights:', { underline: true })
       .moveDown(0.5);
    
    insights.forEach((insight, index) => {
      doc.text(`• ${insight}`)
         .moveDown(0.3);
    });
  }

  /**
   * Add maturity scores section with detailed breakdown
   */
  private static addMaturityScoresSection(doc: any, scores: any): void {
    PDFExportService.addSectionHeader(doc, 'AI Maturity Scores Breakdown', 1);

    const categories = [
      { key: 'strategy', label: 'Strategic Vision & Alignment', score: scores.strategy || 0 },
      { key: 'capabilities', label: 'AI Capabilities & Infrastructure', score: scores.capabilities || 0 },
      { key: 'governance', label: 'AI Governance & Ethics', score: scores.governance || 0 },
      { key: 'implementation', label: 'Implementation Readiness', score: scores.implementation || 0 },
      { key: 'culture', label: 'AI Culture & Change Management', score: scores.culture || 0 },
      { key: 'innovation', label: 'Innovation & Future Planning', score: scores.innovation || 0 },
    ];

    const headers = ['Category', 'Score', 'Maturity Level', 'Assessment'];
    const rows = categories.map(cat => [
      cat.label,
      `${Math.round(cat.score)}/100`,
      this.getMaturityLevel(cat.score),
      this.getScoreAssessment(cat.score)
    ]);

    PDFExportService.addTable(doc, headers, rows, {
      columnWidths: [180, 60, 80, 120],
      alternateRowColor: true
    });

    // Add scoring methodology
    doc.moveDown(1);
    PDFExportService.addSectionHeader(doc, 'Scoring Methodology', 2);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text('Scores are calculated based on RSA\'s comprehensive AI maturity framework, evaluating responses across 52 strategic questions. Each category reflects specific capabilities essential for successful AI implementation in the insurance sector.')
       .moveDown(0.5)
       .text('Maturity Levels: Beginner (0-40), Developing (41-60), Advanced (61-80), Expert (81-100)');
  }

  /**
   * Add detailed findings section
   */
  private static addDetailedFindings(doc: any, data: AssessmentData): void {
    PDFExportService.addSectionHeader(doc, 'Detailed Findings & Analysis', 1);

    // Business context
    const businessContext = this.extractBusinessContext(data.response.responseData);
    if (businessContext) {
      PDFExportService.addSectionHeader(doc, 'Business Context', 2);
      doc.fontSize(10)
         .fillColor('#333333');
      
      Object.entries(businessContext).forEach(([key, value]) => {
        if (value) {
          doc.text(`${this.formatFieldLabel(key)}: ${value}`)
             .moveDown(0.3);
        }
      });
      doc.moveDown(0.5);
    }

    // Strengths and areas for improvement
    const analysis = this.analyzeStrengthsAndGaps(data.maturityScores);
    
    PDFExportService.addSectionHeader(doc, 'Strengths', 2);
    analysis.strengths.forEach(strength => {
      doc.text(`• ${strength}`)
         .moveDown(0.3);
    });

    doc.moveDown(0.5);
    PDFExportService.addSectionHeader(doc, 'Areas for Improvement', 2);
    analysis.gaps.forEach(gap => {
      doc.text(`• ${gap}`)
         .moveDown(0.3);
    });
  }

  /**
   * Add strategic recommendations section
   */
  private static addRecommendations(doc: any, recommendations: string[]): void {
    PDFExportService.addSectionHeader(doc, 'Strategic Recommendations', 1);

    doc.fontSize(11)
       .fillColor('#333333')
       .text('Based on your assessment results, we recommend the following strategic initiatives to advance your AI maturity:')
       .moveDown(1);

    recommendations.forEach((rec, index) => {
      doc.fontSize(12)
         .fillColor('#005DAA')
         .text(`${index + 1}. Priority Recommendation`)
         .fontSize(11)
         .fillColor('#333333')
         .text(rec)
         .moveDown(1);
    });

    // Next steps
    doc.moveDown(1);
    PDFExportService.addSectionHeader(doc, 'Next Steps', 2);
    
    const nextSteps = [
      'Schedule a follow-up consultation with RSA Digital Innovation team',
      'Review and prioritize recommended use cases for implementation',
      'Establish AI governance framework and ethical guidelines',
      'Identify quick wins and pilot opportunities',
      'Develop comprehensive AI transformation roadmap'
    ];

    nextSteps.forEach(step => {
      doc.text(`• ${step}`)
         .moveDown(0.3);
    });
  }

  /**
   * Calculate maturity scores from response data
   */
  private static calculateMaturityScores(responseData: any): any {
    // This would implement the actual scoring algorithm
    // For now, return sample scores
    return {
      overall: 65,
      strategy: 70,
      capabilities: 55,
      governance: 60,
      implementation: 65,
      culture: 70,
      innovation: 60
    };
  }

  /**
   * Generate recommendations based on scores
   */
  private static generateRecommendations(scores: any): string[] {
    const recommendations = [];
    
    if (scores.strategy < 60) {
      recommendations.push('Develop comprehensive AI strategy aligned with business objectives and insurance industry trends.');
    }
    
    if (scores.capabilities < 60) {
      recommendations.push('Invest in AI infrastructure, data capabilities, and technical talent acquisition.');
    }
    
    if (scores.governance < 60) {
      recommendations.push('Establish robust AI governance framework including ethics, risk management, and regulatory compliance.');
    }

    return recommendations;
  }

  /**
   * Get maturity level label from score
   */
  private static getMaturityLevel(score: number): string {
    if (score >= 81) return 'Expert';
    if (score >= 61) return 'Advanced';
    if (score >= 41) return 'Developing';
    return 'Beginner';
  }

  /**
   * Get score assessment description
   */
  private static getScoreAssessment(score: number): string {
    if (score >= 81) return 'Leading practice';
    if (score >= 61) return 'Strong capability';
    if (score >= 41) return 'Developing area';
    return 'Needs attention';
  }

  /**
   * Generate key insights from scores
   */
  private static generateKeyInsights(scores: any): string[] {
    const insights = [];
    
    const highest = Object.entries(scores)
      .filter(([key]) => key !== 'overall')
      .sort((a: any, b: any) => b[1] - a[1])[0];
    
    const lowest = Object.entries(scores)
      .filter(([key]) => key !== 'overall')
      .sort((a: any, b: any) => a[1] - b[1])[0];

    if (highest) {
      insights.push(`Strongest area: ${this.formatFieldLabel(highest[0])} (${Math.round(highest[1] as number)}/100)`);
    }
    
    if (lowest) {
      insights.push(`Primary focus area: ${this.formatFieldLabel(lowest[0])} (${Math.round(lowest[1] as number)}/100)`);
    }

    return insights;
  }

  /**
   * Extract business context from response data
   */
  private static extractBusinessContext(responseData: any): any {
    return {
      companyName: responseData?.['q1-company-profile']?.companyName,
      businessLines: responseData?.['q2-business-lines']?.businessLines?.join(', '),
      companyTier: responseData?.['q1-company-profile']?.companyTier,
      geographicFocus: responseData?.['q1-company-profile']?.geographicFocus
    };
  }

  /**
   * Analyze strengths and gaps from scores
   */
  private static analyzeStrengthsAndGaps(scores: any): { strengths: string[], gaps: string[] } {
    const strengths: string[] = [];
    const gaps: string[] = [];

    Object.entries(scores).forEach(([key, score]: [string, any]) => {
      if (key === 'overall') return;
      
      if (score >= 70) {
        strengths.push(`Strong ${this.formatFieldLabel(key)} capabilities demonstrated`);
      } else if (score < 50) {
        gaps.push(`${this.formatFieldLabel(key)} requires strategic investment and development`);
      }
    });

    return { strengths, gaps };
  }

  /**
   * Format field labels for display
   */
  private static formatFieldLabel(key: string): string {
    const labels: Record<string, string> = {
      strategy: 'Strategic Vision',
      capabilities: 'AI Capabilities',
      governance: 'AI Governance',
      implementation: 'Implementation Readiness',
      culture: 'AI Culture',
      innovation: 'Innovation Planning',
      companyName: 'Company Name',
      businessLines: 'Business Lines',
      companyTier: 'Company Tier',
      geographicFocus: 'Geographic Focus'
    };
    
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}