import PDFDocument from 'pdfkit';
import { db } from '../db';
import { questionnaireResponses, questionnaires } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';

export class EnhancedAssessmentPdfService {
  /**
   * Professional cover page for assessment reports
   */
  private static addProfessionalCoverPage(doc: any, responseData: any): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Clean white background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFFFFF');
    
    // Top blue header band
    doc.rect(0, 0, pageWidth, 80).fill('#005DAA');
    
    // RSA Logo and branding (white on blue)
    doc.fontSize(32)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text('RSA', 60, 25);
    
    doc.fontSize(12)
       .fillColor('#E8F4FD')
       .font('Helvetica')
       .text('INSURANCE', 60, 60);
    
    // Document classification (top right)
    doc.fontSize(10)
       .fillColor('#E8F4FD')
       .font('Helvetica-Bold')
       .text('CONFIDENTIAL', pageWidth - 120, 25);
    
    doc.fontSize(9)
       .fillColor('#B8D9F0')
       .font('Helvetica')
       .text('For Internal Use Only', pageWidth - 120, 42);
    
    // Main title
    doc.fontSize(42)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text('AI Maturity Assessment', 60, 140, { width: pageWidth - 120, lineGap: 8 });
    
    doc.fontSize(20)
       .fillColor('#005DAA')
       .font('Helvetica')
       .text('Executive Assessment Report', 60, 190, { width: pageWidth - 120 });
    
    // Executive summary section
    const summaryY = 250;
    doc.rect(60, summaryY, pageWidth - 120, 100)
       .fill('#F8F9FA')
       .stroke('#E5E7EB');
    
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Assessment Overview', 80, summaryY + 20);
    
    const completedDate = responseData.questionnaire_responses.completedAt 
      ? format(new Date(responseData.questionnaire_responses.completedAt), 'MMMM d, yyyy')
      : 'Recently';
    
    doc.fontSize(11)
       .fillColor('#666666')
       .font('Helvetica')
       .text('Comprehensive evaluation of AI readiness across strategic dimensions including technology infrastructure, data capabilities, governance frameworks, and organizational readiness for AI adoption.', 80, summaryY + 45, { width: pageWidth - 160, lineGap: 4 });
    
    // Assessment details
    const detailsY = 380;
    
    // Participant information box
    doc.rect(60, detailsY, 240, 120).fill('#F0F9FF').stroke('#E0E7FF');
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Participant Details', 80, detailsY + 20);
    
    doc.fontSize(11)
       .fillColor('#374151')
       .font('Helvetica')
       .text(`Name: ${responseData.questionnaire_responses.respondentName || 'Anonymous'}`, 80, detailsY + 45)
       .text(`Email: ${responseData.questionnaire_responses.respondentEmail || 'Not provided'}`, 80, detailsY + 65)
       .text(`Completed: ${completedDate}`, 80, detailsY + 85);
    
    // Assessment metrics box
    doc.rect(320, detailsY, 240, 120).fill('#F0FDF4').stroke('#BBF7D0');
    doc.fontSize(14)
       .fillColor('#22C55E')
       .font('Helvetica-Bold')
       .text('Assessment Status', 340, detailsY + 20);
    
    doc.fontSize(11)
       .fillColor('#374151')
       .font('Helvetica')
       .text('Status: Completed', 340, detailsY + 45)
       .text('Framework: RSA AI Maturity', 340, detailsY + 65)
       .text('Version: 2.0', 340, detailsY + 85);
    
    // Footer
    doc.fontSize(9)
       .fillColor('#999999')
       .font('Helvetica')
       .text('RSA Digital Innovation | AI Maturity Assessment Framework', 60, pageHeight - 50)
       .text('Page 1', pageWidth - 80, pageHeight - 50);
  }

  /**
   * Add professional page header
   */
  private static addPageHeader(doc: any, title: string, pageNum: number): void {
    const pageWidth = doc.page.width;
    
    // Top blue line
    doc.rect(0, 0, pageWidth, 4).fill('#005DAA');
    
    // Header content
    doc.fontSize(12)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('RSA Insurance', 60, 25);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(title, 60, 42);
    
    // Page number
    doc.fontSize(10)
       .fillColor('#999999')
       .text(`Page ${pageNum}`, pageWidth - 80, 42);
    
    // Separator line
    doc.moveTo(60, 60)
       .lineTo(pageWidth - 60, 60)
       .stroke('#E5E7EB');
  }

  /**
   * Add executive summary with key insights
   */
  private static addExecutiveSummary(doc: any): void {
    doc.fontSize(18)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Executive Summary');
    
    doc.y += 25;
    
    // Key insights boxes
    const insights = [
      {
        title: 'AI Readiness Assessment',
        content: 'Organization demonstrates strong foundational capabilities for AI adoption with identified areas for strategic enhancement.',
        color: '#22C55E'
      },
      {
        title: 'Strategic Recommendations',
        content: 'Prioritized roadmap developed focusing on data infrastructure, governance frameworks, and capability development.',
        color: '#005DAA'
      },
      {
        title: 'Implementation Path',
        content: 'Clear next steps identified for accelerated AI transformation with measurable milestones and success criteria.',
        color: '#F59E0B'
      }
    ];
    
    insights.forEach((insight, index) => {
      const boxY = doc.y + (index * 80);
      
      // Insight box
      doc.rect(60, boxY, 480, 70)
         .fill('#F8F9FA')
         .stroke('#E5E7EB');
      
      // Color accent
      doc.rect(60, boxY, 4, 70).fill(insight.color);
      
      // Content
      doc.fontSize(13)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text(insight.title, 80, boxY + 15);
      
      doc.fontSize(11)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text(insight.content, 80, boxY + 35, { width: 440, lineGap: 3 });
    });
    
    doc.y += 260;
  }

  /**
   * Add maturity assessment methodology
   */
  private static addMethodology(doc: any): void {
    doc.fontSize(16)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Assessment Methodology');
    
    doc.y += 20;
    
    doc.fontSize(11)
       .fillColor('#374151')
       .font('Helvetica')
       .text('This assessment evaluates organizational AI readiness across six critical dimensions:', { lineGap: 4 });
    
    doc.y += 25;
    
    const dimensions = [
      'Strategic Vision & AI Governance',
      'Technical Infrastructure & Capabilities', 
      'Data Management & Quality',
      'Talent & Skills Development',
      'Risk Management & Ethics',
      'Change Management & Adoption'
    ];
    
    dimensions.forEach((dimension, index) => {
      doc.fontSize(10)
         .fillColor('#374151')
         .font('Helvetica')
         .text(`${index + 1}. ${dimension}`, 80, doc.y, { indent: 20, lineGap: 3 });
      doc.y += 18;
    });
  }

  /**
   * Generate enhanced assessment report
   */
  static async generateAssessmentReport(responseId: string, res: Response): Promise<void> {
    try {
      console.log('Generating enhanced assessment report for:', responseId);
      
      // Fetch assessment data
      const [responseData] = await db
        .select()
        .from(questionnaireResponses)
        .leftJoin(questionnaires, eq(questionnaireResponses.questionnaireId, questionnaires.id))
        .where(eq(questionnaireResponses.id, responseId));

      if (!responseData) {
        console.log('No response data found for ID:', responseId);
        return res.status(404).json({ error: 'Assessment response not found' });
      }

      console.log('Assessment data fetched successfully');
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_AI_Maturity_Assessment_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      // Stream PDF to response
      doc.pipe(res);

      // PAGE 1: Professional Cover Page
      this.addProfessionalCoverPage(doc, responseData);
      
      // PAGE 2: Executive Summary
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment Report', 2);
      doc.y = 80;
      
      this.addExecutiveSummary(doc);
      
      // PAGE 3: Assessment Methodology
      doc.addPage();
      this.addPageHeader(doc, 'AI Maturity Assessment Report', 3);
      doc.y = 80;
      
      this.addMethodology(doc);
      
      // Add strategic recommendations section
      doc.y += 40;
      
      doc.fontSize(16)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Strategic Recommendations');
      
      doc.y += 20;
      
      const recommendations = [
        'Establish AI Center of Excellence for governance and best practices',
        'Implement comprehensive data governance framework',
        'Develop AI talent acquisition and training programs',
        'Create proof-of-concept pipeline for rapid experimentation',
        'Deploy ethical AI guidelines and monitoring systems'
      ];
      
      recommendations.forEach((rec, index) => {
        doc.fontSize(11)
           .fillColor('#374151')
           .font('Helvetica')
           .text(`${index + 1}. ${rec}`, 60, doc.y, { width: 480, lineGap: 4 });
        doc.y += 25;
      });

      // Footer
      doc.fontSize(9)
         .fillColor('#999999')
         .font('Helvetica')
         .text('RSA Digital Innovation | AI Maturity Assessment Framework', 60, doc.page.height - 50)
         .text(`Generated ${format(new Date(), 'MMM d, yyyy')}`, doc.page.width - 150, doc.page.height - 50);

      // End the document
      doc.end();
      console.log('Enhanced assessment report generated successfully');

    } catch (error) {
      console.error('Failed to generate enhanced assessment report:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to export assessment report' });
      }
    }
  }
}