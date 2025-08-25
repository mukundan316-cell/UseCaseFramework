import PDFDocument from 'pdfkit';
import { db } from '../db';
import { useCases } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor } from './useCaseDataExtractor';

export class UseCasePdfService {
  /**
   * Create executive-style cover page for use case reports
   */
  private static addExecutiveCoverPage(doc: any, reportType: string, summary: any): void {
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
    const titleText = reportType === 'portfolio' ? 'AI Portfolio Report' : 'Use Case Library';
    doc.fontSize(36)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text(titleText, 0, 200, { align: 'center', width: pageWidth });
    
    const subtitleText = reportType === 'portfolio' ? 'Strategic Implementation Overview' : 'Comprehensive AI Opportunity Catalog';
    doc.fontSize(24)
       .fillColor('#005DAA')
       .font('Helvetica')
       .text(subtitleText, 0, 250, { align: 'center', width: pageWidth });
    
    // Executive summary box
    const boxY = 320;
    doc.rect(80, boxY, pageWidth - 160, 140)
       .stroke('#E5E5E5')
       .strokeColor('#E5E5E5');
    
    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('Executive Summary', 100, boxY + 20);
    
    const totalUseCases = summary?.totalUseCases || 0;
    const activeUseCases = summary?.activeUseCases || 0;
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Total Use Cases: ${totalUseCases}`, 100, boxY + 45)
       .text(`Active Portfolio: ${activeUseCases}`, 100, boxY + 60)
       .text(`Organization: RSA Insurance`, 100, boxY + 75)
       .text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 100, boxY + 90)
       .text(`Classification: Strategic Investment Document`, 100, boxY + 105);
    
    // Bottom section with key insights
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Key Insights', 60, 500);
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica')
       .text('This catalog presents RSA\'s comprehensive AI use case portfolio, strategically evaluated', 60, 525, { width: 480, lineGap: 4 })
       .text('for business impact and implementation feasibility. Each use case represents a', 60, 545, { width: 480, lineGap: 4 })
       .text('validated opportunity for digital transformation and competitive advantage.', 60, 565, { width: 480, lineGap: 4 });
    
    // Footer with page indicator
    doc.fontSize(8)
       .fillColor('#999999')
       .text('RSA Digital Innovation | AI Use Case Value Framework', 60, pageHeight - 40)
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
   * Add use case card to PDF
   */
  private static addUseCaseCard(doc: any, useCase: any, index: number): void {
    if (doc.y > 650) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Use Case Portfolio', Math.ceil(index / 6) + 2);
      doc.y = 80;
    }

    const cardY = doc.y;
    const cardHeight = 110;

    // Card background with blue left border
    doc.rect(60, cardY, 4, cardHeight).fill('#005DAA');
    doc.rect(64, cardY, 476, cardHeight).fill('#FFFFFF').stroke('#E5E5E5');

    // Use case title
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(useCase.title, 80, cardY + 15, { width: 300 });

    // Description
    doc.fontSize(10)
       .fillColor('#333333')
       .font('Helvetica')
       .text(useCase.description || 'No description available', 80, cardY + 35, { 
         width: 300,
         height: 30,
         ellipsis: true
       });

    // Tags
    let tagY = cardY + 70;
    if (useCase.process) {
      doc.fontSize(8)
         .fillColor('#3B82F6')
         .text(`Process: ${useCase.process}`, 80, tagY);
      tagY += 12;
    }
    
    if (useCase.useCaseType) {
      doc.fontSize(8)
         .fillColor('#7C3AED')
         .text(`Type: ${useCase.useCaseType}`, 80, tagY);
    }

    // Status badge
    const isActive = useCase.isActiveForRsa === 'true';
    const statusColor = isActive ? '#22C55E' : '#6B7280';
    const statusText = isActive ? 'ACTIVE' : 'LIBRARY';
    
    doc.rect(420, cardY + 15, 60, 20).fill(statusColor);
    doc.fontSize(8)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text(statusText, 425, cardY + 21);

    // Scores if available
    if (useCase.impactScore || useCase.effortScore) {
      doc.fontSize(9)
         .fillColor('#333333')
         .font('Helvetica')
         .text(`Impact: ${useCase.impactScore || 'N/A'}`, 420, cardY + 45)
         .text(`Effort: ${useCase.effortScore || 'N/A'}`, 420, cardY + 58);
    }
    
    doc.y = cardY + cardHeight + 15;
  }

  /**
   * Add comprehensive use case details across all 4 tabs
   */
  private static addComprehensiveUseCaseDetails(doc: any, useCase: any, index: number): void {
    // Check if we have enough space for a new use case section
    if (doc.y > 600) {
      doc.addPage();
      this.addPageHeader(doc, 'Use Case Details', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    // Use case header with number and title
    doc.fontSize(16)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(`${index + 1}. ${useCase.title}`, 60, doc.y);
    
    doc.moveDown(1);
    
    // TAB 1: BASIC INFORMATION
    this.addSectionHeader(doc, 'BASIC INFORMATION');
    
    this.addDetailRow(doc, 'Description', useCase.description);
    this.addDetailRow(doc, 'Problem Statement', useCase.problemStatement);
    this.addDetailRow(doc, 'Use Case Type', useCase.useCaseType);
    this.addDetailRow(doc, 'Process', useCase.process);
    this.addDetailRow(doc, 'Line of Business', useCase.lineOfBusiness);
    this.addDetailRow(doc, 'Business Segment', useCase.businessSegment);
    this.addDetailRow(doc, 'Geography', useCase.geography);
    
    doc.moveDown(0.5);
    
    // TAB 2: BUSINESS CONTEXT
    this.addSectionHeader(doc, 'BUSINESS CONTEXT');
    
    this.addDetailRow(doc, 'Lines of Business', this.formatArray(useCase.linesOfBusiness));
    this.addDetailRow(doc, 'Business Segments', this.formatArray(useCase.businessSegments));
    this.addDetailRow(doc, 'Geographies', this.formatArray(useCase.geographies));
    this.addDetailRow(doc, 'Processes', this.formatArray(useCase.processes));
    this.addDetailRow(doc, 'Activities', this.formatArray(useCase.activities));
    
    doc.moveDown(0.5);
    
    // TAB 3: IMPLEMENTATION & GOVERNANCE
    this.addSectionHeader(doc, 'IMPLEMENTATION & GOVERNANCE');
    
    this.addDetailRow(doc, 'Primary Business Owner', useCase.primaryBusinessOwner);
    this.addDetailRow(doc, 'Use Case Status', useCase.useCaseStatus);
    this.addDetailRow(doc, 'Key Dependencies', useCase.keyDependencies);
    this.addDetailRow(doc, 'Implementation Timeline', useCase.implementationTimeline);
    this.addDetailRow(doc, 'Success Metrics', useCase.successMetrics);
    this.addDetailRow(doc, 'Estimated Value', useCase.estimatedValue);
    this.addDetailRow(doc, 'Value Measurement Approach', useCase.valueMeasurementApproach);
    this.addDetailRow(doc, 'Integration Requirements', useCase.integrationRequirements);
    this.addDetailRow(doc, 'AI/ML Technologies', this.formatArray(useCase.aiMlTechnologies));
    this.addDetailRow(doc, 'Data Sources', this.formatArray(useCase.dataSources));
    this.addDetailRow(doc, 'Stakeholder Groups', this.formatArray(useCase.stakeholderGroups));
    
    doc.moveDown(0.5);
    
    // TAB 4: RSA FRAMEWORK ASSESSMENT
    this.addSectionHeader(doc, 'RSA FRAMEWORK ASSESSMENT');
    
    // Business Value dimensions
    this.addScoreSubsection(doc, 'Business Value');
    this.addScoreRow(doc, 'Revenue Impact', useCase.revenueImpact);
    this.addScoreRow(doc, 'Cost Savings', useCase.costSavings);
    this.addScoreRow(doc, 'Risk Reduction', useCase.riskReduction);
    this.addScoreRow(doc, 'Broker Partner Experience', useCase.brokerPartnerExperience);
    this.addScoreRow(doc, 'Strategic Fit', useCase.strategicFit);
    
    // Feasibility dimensions
    this.addScoreSubsection(doc, 'Feasibility');
    this.addScoreRow(doc, 'Data Readiness', useCase.dataReadiness);
    this.addScoreRow(doc, 'Technical Complexity', useCase.technicalComplexity);
    this.addScoreRow(doc, 'Change Impact', useCase.changeImpact);
    this.addScoreRow(doc, 'Model Risk', useCase.modelRisk);
    this.addScoreRow(doc, 'Adoption Readiness', useCase.adoptionReadiness);
    
    // AI Governance dimensions
    this.addScoreSubsection(doc, 'AI Governance');
    this.addScoreRow(doc, 'Explainability & Bias', useCase.explainabilityBias);
    this.addScoreRow(doc, 'Regulatory Compliance', useCase.regulatoryCompliance);
    
    // Manual Override Information
    if (useCase.manualImpactScore || useCase.manualEffortScore) {
      this.addScoreSubsection(doc, 'Manual Overrides');
      this.addDetailRow(doc, 'Manual Impact Score', useCase.manualImpactScore?.toString());
      this.addDetailRow(doc, 'Manual Effort Score', useCase.manualEffortScore?.toString());
      this.addDetailRow(doc, 'Manual Quadrant', useCase.manualQuadrant);
      this.addDetailRow(doc, 'Override Reason', useCase.overrideReason);
    }
    
    // Calculated Scores
    if (useCase.calculatedImpactScore || useCase.calculatedEffortScore) {
      this.addScoreSubsection(doc, 'Calculated Scores');
      this.addDetailRow(doc, 'Impact Score', useCase.calculatedImpactScore?.toString());
      this.addDetailRow(doc, 'Effort Score', useCase.calculatedEffortScore?.toString());
      this.addDetailRow(doc, 'Strategic Quadrant', useCase.strategicQuadrant);
    }
    
    // Portfolio Information
    this.addScoreSubsection(doc, 'Portfolio Status');
    this.addDetailRow(doc, 'Portfolio', useCase.isActiveForRsa === 'true' ? 'RSA Active Portfolio' : 'Reference Library');
    this.addDetailRow(doc, 'Dashboard Visible', useCase.isDashboardVisible ? 'Yes' : 'No');
    
    // Add separator line before next use case
    doc.moveDown(1);
    doc.moveTo(60, doc.y)
       .lineTo(540, doc.y)
       .stroke('#E5E5E5');
    doc.moveDown(1);
  }

  /**
   * Add section header for use case details
   */
  private static addSectionHeader(doc: any, title: string): void {
    doc.fontSize(12)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(title, 60, doc.y);
    
    doc.moveDown(0.3);
    
    // Add underline
    const textWidth = doc.widthOfString(title);
    doc.moveTo(60, doc.y - 5)
       .lineTo(60 + textWidth, doc.y - 5)
       .stroke('#005DAA');
    
    doc.moveDown(0.5);
  }

  /**
   * Add score subsection header
   */
  private static addScoreSubsection(doc: any, title: string): void {
    doc.fontSize(10)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(title, 80, doc.y);
    
    doc.moveDown(0.3);
  }

  /**
   * Add detail row with label and value
   */
  private static addDetailRow(doc: any, label: string, value: any): void {
    if (!value || value === '' || value === null || value === undefined) return;
    
    // Check if we need a new page
    if (doc.y > 720) {
      doc.addPage();
      this.addPageHeader(doc, 'Use Case Details', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    const startY = doc.y;
    
    // Label
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica-Bold')
       .text(`${label}:`, 80, startY, { width: 120 });
    
    // Value
    const displayValue = typeof value === 'string' ? value : String(value);
    doc.fontSize(9)
       .fillColor('#333333')
       .font('Helvetica')
       .text(displayValue, 210, startY, { width: 320, lineGap: 2 });
    
    doc.moveDown(0.4);
  }

  /**
   * Add score row with visual indicator
   */
  private static addScoreRow(doc: any, label: string, score: any): void {
    if (!score || score === '' || score === null || score === undefined) return;
    
    // Check if we need a new page
    if (doc.y > 720) {
      doc.addPage();
      this.addPageHeader(doc, 'Use Case Details', Math.floor(doc.pageNumber));
      doc.y = 80;
    }
    
    const startY = doc.y;
    
    // Label
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica-Bold')
       .text(`${label}:`, 100, startY, { width: 120 });
    
    // Score value
    doc.fontSize(9)
       .fillColor('#333333')
       .font('Helvetica')
       .text(String(score), 230, startY);
    
    // Visual score indicator (1-5 scale)
    const scoreNum = parseInt(String(score)) || 1;
    for (let i = 1; i <= 5; i++) {
      const circleX = 260 + (i * 15);
      doc.circle(circleX, startY + 5, 4);
      
      if (i <= scoreNum) {
        doc.fill('#005DAA');
      } else {
        doc.stroke('#E5E5E5').fillAndStroke('#FFFFFF', '#E5E5E5');
      }
    }
    
    doc.moveDown(0.4);
  }

  /**
   * Format array values for display
   */
  private static formatArray(value: any): string {
    if (!value) return '';
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.join(', ') : value;
      } catch {
        return value;
      }
    }
    
    return String(value);
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
   * Generate comprehensive individual use case report with all 4 tabs
   */
  static async generateUseCaseReport(useCaseId: string, res: Response): Promise<void> {
    try {
      console.log('Generating comprehensive use case report for:', useCaseId);
      
      // Fetch use case data
      const [useCase] = await db
        .select()
        .from(useCases)
        .where(eq(useCases.id, useCaseId));

      if (!useCase) {
        res.status(404).json({ error: 'Use case not found' });
        return;
      }

      console.log('Use case data fetched successfully');
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Use_Case_${useCase.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      const summary = { totalUseCases: 1, activeUseCases: useCase.isActiveForRsa === 'true' ? 1 : 0 };
      this.addExecutiveCoverPage(doc, 'individual', summary);
      
      // PAGE 2: Comprehensive Use Case Details
      doc.addPage();
      this.addPageHeader(doc, 'Use Case Details', 2);
      doc.y = 80;
      
      // Add comprehensive details using new method
      this.addComprehensiveUseCaseDetails(doc, useCase, 0);

      // Add footer
      this.addPageFooter(doc);

      doc.end();
      console.log('Comprehensive use case report generated successfully');

    } catch (error) {
      console.error('Failed to generate use case PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate use case report' });
      }
    }
  }

  /**
   * Generate enhanced library catalog with filters
   */
  static async generateEnhancedLibraryCatalog(filters: { category?: string; status?: string }, res: Response): Promise<void> {
    try {
      console.log('Generating enhanced library catalog with filters:', filters);
      
      // Fetch use cases with filters
      const useCaseData = await this.fetchUseCases(filters);
      console.log('Found use cases:', useCaseData.length);
      
      // Calculate summary statistics
      const summary = {
        totalUseCases: useCaseData.length,
        activeUseCases: useCaseData.filter(uc => uc.isActiveForRsa === 'true').length
      };

      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Use_Case_Library_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      // Stream PDF to response
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, 'library', summary);
      
      // PAGE 2+: Use Case Cards
      doc.addPage();
      this.addPageHeader(doc, 'AI Use Case Portfolio', 2);
      doc.y = 80;
      
      if (useCaseData.length > 0) {
        useCaseData.forEach((useCase, index) => {
          this.addComprehensiveUseCaseDetails(doc, useCase, index);
        });
      } else {
        // Empty state message
        const messageY = doc.y;
        doc.rect(60, messageY, 480, 60).fill('#F9FAFB').stroke('#E5E5E5');
        
        doc.fontSize(12)
           .fillColor('#666666')
           .font('Helvetica')
           .text('No use cases found matching the specified filters.', 80, messageY + 20)
           .text('Please adjust your search criteria and try again.', 80, messageY + 35);
        
        doc.y = messageY + 80;
      }

      // Add footer
      this.addPageFooter(doc);

      doc.end();
      console.log('Enhanced library catalog generated successfully');

    } catch (error) {
      console.error('Failed to generate library PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate library catalog' });
      }
    }
  }

  /**
   * Generate executive portfolio report
   */
  static async generateExecutivePortfolioReport(res: Response): Promise<void> {
    try {
      console.log('Generating executive portfolio report');
      
      // Fetch only active use cases for portfolio
      const activeUseCases = await db
        .select()
        .from(useCases)
        .where(eq(useCases.isActiveForRsa, 'true'));

      console.log('Found active use cases:', activeUseCases.length);
      
      const summary = {
        totalUseCases: activeUseCases.length,
        activeUseCases: activeUseCases.length
      };

      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Executive_Portfolio_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      // Stream PDF to response
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, 'portfolio', summary);
      
      // PAGE 2+: Active Use Cases
      doc.addPage();
      this.addPageHeader(doc, 'Active Portfolio Implementation', 2);
      doc.y = 80;
      
      if (activeUseCases.length > 0) {
        activeUseCases.forEach((useCase, index) => {
          this.addComprehensiveUseCaseDetails(doc, useCase, index);
        });
      } else {
        // Empty portfolio message
        const messageY = doc.y;
        doc.rect(60, messageY, 480, 60).fill('#F9FAFB').stroke('#E5E5E5');
        
        doc.fontSize(12)
           .fillColor('#666666')
           .font('Helvetica')
           .text('No active use cases are currently in the portfolio. Consider moving high-priority', 80, messageY + 20)
           .text('use cases from the reference library to begin implementation.', 80, messageY + 35);
        
        doc.y = messageY + 80;
      }

      // Add footer
      this.addPageFooter(doc);

      doc.end();
      console.log('Executive portfolio report generated successfully');

    } catch (error) {
      console.error('Failed to generate portfolio PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate portfolio report' });
      }
    }
  }

  /**
   * Fetch use cases with filters
   */
  private static async fetchUseCases(filters: { category?: string; status?: string }): Promise<any[]> {
    const query = db.select().from(useCases);

    // Apply filters based on what's available in the schema
    const conditions = [];
    if (filters.category && filters.category !== 'all') {
      conditions.push(eq(useCases.useCaseType, filters.category));
    }
    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(useCases.isActiveForRsa, filters.status === 'active' ? 'true' : 'false'));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }
}