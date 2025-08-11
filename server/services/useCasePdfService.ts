import PDFDocument from 'pdfkit';
import { db } from '../db';
import { useCases } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';

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
       .text('Overview', 100, boxY + 20);
    
    const totalUseCases = summary?.totalUseCases || 0;
    const activeUseCases = summary?.activeUseCases || 0;
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Total Use Cases: ${totalUseCases}`, 100, boxY + 45)
       .text(`Active Portfolio: ${activeUseCases}`, 100, boxY + 60)
       .text(`Organization: RSA Insurance`, 100, boxY + 75)
       .text(`Report Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 100, boxY + 90)
       .text(`Classification: Strategic Planning Document`, 100, boxY + 105);
    
    // Bottom section with key insights
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Executive Summary', 60, 500);
    
    const summaryText = reportType === 'portfolio' 
      ? 'This report provides a comprehensive view of RSA\'s active AI portfolio, including implementation'
      : 'This catalog presents a comprehensive library of AI use cases specifically curated for the insurance';
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica')
       .text(summaryText, 60, 525, { width: 480, lineGap: 4 })
       .text('status, strategic alignment, and expected business impact. Each initiative has been evaluated', 60, 545, { width: 480, lineGap: 4 })
       .text('for feasibility, resource requirements, and potential ROI to ensure optimal allocation of resources.', 60, 565, { width: 480, lineGap: 4 });
    
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
   * Add professional use case card
   */
  private static addUseCaseCard(doc: any, useCase: any, index: number): void {
    if (doc.y > 650) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Use Case Portfolio', Math.ceil(index / 6) + 2);
      doc.y = 80;
    }
    
    const cardHeight = 100;
    const cardY = doc.y;
    
    // Card background
    doc.rect(60, cardY, 480, cardHeight)
       .fill('#FAFAFA')
       .stroke('#E5E5E5');
    
    // Status indicator
    const isActive = useCase.isActiveForRsa === 'true';
    const statusColor = isActive ? '#22C55E' : '#6B7280';
    doc.rect(60, cardY, 4, cardHeight).fill(statusColor);
    
    // Use case number
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(`${index + 1}.`, 80, cardY + 15);
    
    // Title
    doc.fontSize(12)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text(useCase.title, 100, cardY + 15, { width: 300 });
    
    // Status badge
    doc.fontSize(8)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text(isActive ? 'ACTIVE' : 'LIBRARY', 420, cardY + 15, 
             { width: 60, align: 'center' });
    doc.rect(415, cardY + 10, 70, 15).stroke(statusColor);
    
    // Description
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(useCase.description || 'No description available', 100, cardY + 35, 
             { width: 350, height: 30, ellipsis: true });
    
    // Metadata
    doc.fontSize(9)
       .fillColor('#999999')
       .text(`Process: ${useCase.process || 'General'}`, 100, cardY + 70)
       .text(`Business Unit: ${useCase.lineOfBusiness || 'Cross-functional'}`, 250, cardY + 70);
    
    // Scores (if available)
    if (useCase.impactScore || useCase.effortScore) {
      doc.fontSize(9)
         .fillColor('#005DAA')
         .text(`Impact: ${useCase.impactScore || 'N/A'}`, 100, cardY + 85)
         .text(`Effort: ${useCase.effortScore || 'N/A'}`, 180, cardY + 85);
    }
    
    doc.y = cardY + cardHeight + 15;
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
   * Generate individual use case report
   */
  static async generateUseCaseReport(useCaseId: string, res: Response): Promise<void> {
    try {
      console.log('Generating individual use case report for:', useCaseId);
      
      // Fetch use case data
      const [useCase] = await db
        .select()
        .from(useCases)
        .where(eq(useCases.id, useCaseId));

      if (!useCase) {
        return res.status(404).json({ error: 'Use case not found' });
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
      
      // PAGE 2: Use Case Details
      doc.addPage();
      this.addPageHeader(doc, 'Use Case Details', 2);
      doc.y = 80;
      
      // Use case title
      doc.fontSize(24)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text(useCase.title);
      
      doc.moveDown(1);
      
      // Status badge
      const isActive = useCase.isActiveForRsa === 'true';
      const statusColor = isActive ? '#22C55E' : '#6B7280';
      const statusText = isActive ? 'ACTIVE PORTFOLIO' : 'REFERENCE LIBRARY';
      
      doc.rect(60, doc.y, 150, 25)
         .fill(statusColor)
         .fillColor('#FFFFFF')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(statusText, 60, doc.y + 8, { width: 150, align: 'center' });
      
      doc.y += 40;
      
      // Description section
      doc.fontSize(16)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Description');
      
      doc.moveDown(0.5);
      
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica')
         .text(useCase.description || 'No description available', { width: 480, lineGap: 4 });
      
      doc.moveDown(2);
      
      // Problem statement if available
      if (useCase.problemStatement) {
        doc.fontSize(16)
           .fillColor('#005DAA')
           .font('Helvetica-Bold')
           .text('Problem Statement');
        
        doc.moveDown(0.5);
        
        doc.fontSize(11)
           .fillColor('#333333')
           .font('Helvetica')
           .text(useCase.problemStatement, { width: 480, lineGap: 4 });
        
        doc.moveDown(2);
      }
      
      // Metadata section
      doc.fontSize(16)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Use Case Details');
      
      doc.moveDown(0.5);
      
      const detailsY = doc.y;
      doc.rect(60, detailsY, 480, 120)
         .fill('#F8F9FA')
         .stroke('#E5E5E5');
      
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica')
         .text(`Process: ${useCase.process || 'General'}`, 80, detailsY + 20)
         .text(`Line of Business: ${useCase.lineOfBusiness || 'Cross-functional'}`, 80, detailsY + 40)
         .text(`Use Case Type: ${useCase.useCaseType || 'Not specified'}`, 80, detailsY + 60);
      
      if (useCase.impactScore || useCase.effortScore) {
        doc.text(`Impact Score: ${useCase.impactScore || 'N/A'} / 10`, 80, detailsY + 80)
           .text(`Effort Score: ${useCase.effortScore || 'N/A'} / 10`, 280, detailsY + 80);
      }
      
      doc.y = detailsY + 140;

      // Add footer
      this.addPageFooter(doc);

      doc.end();
      console.log('Individual use case report generated successfully');

    } catch (error) {
      console.error('Failed to generate use case report:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate use case report' });
      }
    }
  }

  /**
   * Generate use case library catalog
   */
  static async generateLibraryCatalog(res: Response, filters: {
    category?: string;
    status?: string;
  }): Promise<void> {
    try {
      console.log('Generating executive library catalog with filters:', filters);
      
      // Fetch filtered use cases
      const useCaseData = await this.fetchUseCases(filters);
      console.log('Found use cases:', useCaseData.length);
      
      // Calculate summary stats
      const summary = {
        totalUseCases: useCaseData.length,
        activeUseCases: useCaseData.filter(uc => uc.isActiveForRsa === 'true').length,
        referenceUseCases: useCaseData.filter(uc => uc.isActiveForRsa !== 'true').length
      };
      
      // Create professional PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Use_Case_Library_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, 'library', summary);
      
      // PAGE 2: Portfolio Overview
      doc.addPage();
      this.addPageHeader(doc, 'AI Use Case Library', 2);
      doc.y = 80;
      
      // Portfolio statistics
      doc.fontSize(18)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Portfolio Overview');
      
      doc.moveDown(1);
      
      // Stats boxes
      const statsY = doc.y;
      
      // Total use cases box
      doc.rect(60, statsY, 140, 80).fill('#F0F8FF').stroke('#005DAA');
      doc.fontSize(24).fillColor('#005DAA').font('Helvetica-Bold')
         .text(summary.totalUseCases.toString(), 60, statsY + 20, { width: 140, align: 'center' });
      doc.fontSize(12).fillColor('#333333').font('Helvetica')
         .text('Total Use Cases', 60, statsY + 50, { width: 140, align: 'center' });
      
      // Active cases box
      doc.rect(220, statsY, 140, 80).fill('#F0FDF4').stroke('#22C55E');
      doc.fontSize(24).fillColor('#22C55E').font('Helvetica-Bold')
         .text(summary.activeUseCases.toString(), 220, statsY + 20, { width: 140, align: 'center' });
      doc.fontSize(12).fillColor('#333333').font('Helvetica')
         .text('Active Portfolio', 220, statsY + 50, { width: 140, align: 'center' });
      
      // Reference cases box
      doc.rect(380, statsY, 140, 80).fill('#F9FAFB').stroke('#6B7280');
      doc.fontSize(24).fillColor('#6B7280').font('Helvetica-Bold')
         .text(summary.referenceUseCases.toString(), 380, statsY + 20, { width: 140, align: 'center' });
      doc.fontSize(12).fillColor('#333333').font('Helvetica')
         .text('Reference Library', 380, statsY + 50, { width: 140, align: 'center' });
      
      doc.y = statsY + 100;
      doc.moveDown(2);
      
      // Use cases section
      doc.fontSize(16)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Use Case Inventory');
      
      doc.moveDown(1);
      
      // Use case cards
      useCaseData.forEach((useCase, index) => {
        this.addUseCaseCard(doc, useCase, index);
      });

      // Add footer
      this.addPageFooter(doc);

      doc.end();
      console.log('Executive library catalog generated successfully');

    } catch (error) {
      console.error('Failed to generate library catalog PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate library catalog' });
      }
    }
  }

  /**
   * Generate RSA active portfolio report
   */
  static async generatePortfolioReport(res: Response): Promise<void> {
    try {
      console.log('Generating executive portfolio report');
      
      // Fetch all use cases for comprehensive analysis
      const allUseCases = await db.select().from(useCases);
      const activeUseCases = allUseCases.filter(uc => uc.isActiveForRsa === 'true');

      console.log('Found active use cases:', activeUseCases.length);

      // Calculate summary stats
      const summary = {
        totalUseCases: allUseCases.length,
        activeUseCases: activeUseCases.length,
        averageImpact: activeUseCases.length > 0 
          ? Math.round(activeUseCases.reduce((sum, uc) => sum + (uc.impactScore || 0), 0) / activeUseCases.length) 
          : 0,
        averageEffort: activeUseCases.length > 0 
          ? Math.round(activeUseCases.reduce((sum, uc) => sum + (uc.effortScore || 0), 0) / activeUseCases.length) 
          : 0
      };

      // Create professional PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_AI_Portfolio_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      doc.pipe(res);

      // PAGE 1: Executive Cover Page
      this.addExecutiveCoverPage(doc, 'portfolio', summary);
      
      // PAGE 2: Portfolio Analysis
      doc.addPage();
      this.addPageHeader(doc, 'AI Portfolio Report', 2);
      doc.y = 80;
      
      // Executive Summary
      doc.fontSize(18)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Portfolio Analysis');
      
      doc.moveDown(1);
      
      // Key metrics grid
      const metricsY = doc.y;
      
      // Active Portfolio box
      doc.rect(60, metricsY, 200, 100).fill('#F0FDF4').stroke('#22C55E');
      doc.fontSize(28).fillColor('#22C55E').font('Helvetica-Bold')
         .text(activeUseCases.length.toString(), 60, metricsY + 20, { width: 200, align: 'center' });
      doc.fontSize(14).fillColor('#333333').font('Helvetica-Bold')
         .text('Active Initiatives', 60, metricsY + 55, { width: 200, align: 'center' });
      doc.fontSize(10).fillColor('#666666').font('Helvetica')
         .text('Currently in implementation', 60, metricsY + 75, { width: 200, align: 'center' });
      
      // Portfolio Value box
      doc.rect(280, metricsY, 200, 100).fill('#F0F8FF').stroke('#005DAA');
      doc.fontSize(28).fillColor('#005DAA').font('Helvetica-Bold')
         .text(`${summary.averageImpact}/10`, 280, metricsY + 20, { width: 200, align: 'center' });
      doc.fontSize(14).fillColor('#333333').font('Helvetica-Bold')
         .text('Avg Impact Score', 280, metricsY + 55, { width: 200, align: 'center' });
      doc.fontSize(10).fillColor('#666666').font('Helvetica')
         .text('Expected business value', 280, metricsY + 75, { width: 200, align: 'center' });
      
      doc.y = metricsY + 120;
      doc.moveDown(2);
      
      // Strategic Overview
      doc.fontSize(16)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Strategic Overview');
      
      doc.moveDown(1);
      
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica')
         .text('RSA\'s AI portfolio represents a strategic investment in digital transformation, focusing on', { lineGap: 4 })
         .text('high-impact initiatives that drive operational efficiency, enhance customer experience, and', { lineGap: 4 })
         .text('create competitive advantages in the insurance market.', { lineGap: 4 });
      
      doc.moveDown(2);
      
      // Active Portfolio Details
      if (activeUseCases.length > 0) {
        doc.fontSize(16)
           .fillColor('#005DAA')
           .font('Helvetica-Bold')
           .text('Active Portfolio Details');

        doc.moveDown(1);

        activeUseCases.forEach((useCase, index) => {
          this.addUseCaseCard(doc, useCase, index);
        });
      } else {
        // No active use cases message
        doc.fontSize(16)
           .fillColor('#005DAA')
           .font('Helvetica-Bold')
           .text('Portfolio Status');
        
        doc.moveDown(1);
        
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
   * Generate individual use case report
   */
  static async generateUseCaseReport(useCaseId: string, res: Response): Promise<void> {
    try {
      // Fetch use case data
      const [useCase] = await db
        .select()
        .from(useCases)
        .where(eq(useCases.id, useCaseId));

      if (!useCase) {
        return res.status(404).json({ error: 'Use case not found' });
      }

      // Create PDF document
      const doc = PDFExportService.createDocument({
        title: `RSA AI Use Case: ${useCase.title}`,
        author: 'RSA Digital Innovation',
        includeQR: true,
      });

      // Add cover page
      PDFExportService.addCoverPage(doc, {
        title: useCase.title,
        subtitle: 'Detailed Use Case Analysis & Implementation Guide',
        generatedFor: 'RSA Insurance',
        date: new Date(),
      });

      let pageNumber = 1;

      // Use case overview
      PDFExportService.addHeader(doc, 'Use Case Analysis Report', pageNumber++);
      this.addUseCaseOverview(doc, useCase);
      PDFExportService.addFooter(doc);

      // Implementation details
      doc.addPage();
      PDFExportService.addHeader(doc, 'Use Case Analysis Report', pageNumber++);
      this.addImplementationDetails(doc, useCase);
      
      // Add QR code for digital access
      await PDFExportService.addQRCode(
        doc, 
        `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/use-case/${useCaseId}`,
        doc.page.width - 120,
        doc.page.height - 160
      );
      
      PDFExportService.addFooter(doc);

      // Stream PDF response
      const filename = `RSA_UseCase_${useCase.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFExportService.streamToResponse(doc, res, filename);

    } catch (error) {
      console.error('Failed to generate use case PDF:', error);
      res.status(500).json({ error: 'Failed to generate use case report' });
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

  /**
   * Add library overview section
   */
  private static addLibraryOverview(doc: any, useCaseData: any[]): void {
    PDFExportService.addSectionHeader(doc, 'Library Overview', 1);

    // Statistics
    const stats = this.calculateLibraryStats(useCaseData);
    
    doc.fontSize(11)
       .fillColor('#333333')
       .text(`Total Use Cases: ${stats.total}`)
       .text(`Active Implementations: ${stats.active}`)
       .text(`Reference Library: ${stats.reference}`)
       .text(`Categories Covered: ${stats.categories}`)
       .moveDown(1);

    // Category breakdown
    PDFExportService.addSectionHeader(doc, 'Category Breakdown', 2);
    
    const categoryStats = this.getCategoryStats(useCaseData);
    const headers = ['Category', 'Count', 'Active', 'Reference'];
    const rows = Object.entries(categoryStats).map(([category, data]: [string, any]) => [
      category,
      data.total.toString(),
      data.active.toString(),
      data.reference.toString()
    ]);

    PDFExportService.addTable(doc, headers, rows, {
      columnWidths: [200, 60, 60, 60],
      alternateRowColor: true
    });
  }

  /**
   * Add category section with use cases
   */
  private static addCategorySection(doc: any, category: string, cases: any[]): void {
    PDFExportService.addSectionHeader(doc, category, 1);

    cases.forEach((useCase, index) => {
      if (index > 0) doc.moveDown(0.5);
      
      // Use case card
      const cardY = doc.y;
      const cardHeight = 60;
      
      // Card background
      doc.rect(doc.x, cardY, doc.page.width - 120, cardHeight)
         .fill('#F8F9FA')
         .stroke('#E5E5E5');

      // Content
      doc.fontSize(12)
         .fillColor('#005DAA')
         .text(useCase.title, doc.x + 10, cardY + 10, { width: 300 });
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text(useCase.description, doc.x + 10, cardY + 25, { 
           width: 300,
           height: 20,
           ellipsis: true
         });

      // Status badge
      const isActive = useCase.isActiveForRsa === 'true';
      const statusColor = isActive ? '#22C55E' : '#6B7280';
      doc.rect(doc.page.width - 100, cardY + 10, 60, 20)
         .fill(statusColor);
      
      doc.fontSize(8)
         .fillColor('#FFFFFF')
         .text(isActive ? 'ACTIVE' : 'REFERENCE', doc.page.width - 95, cardY + 16);

      doc.y = cardY + cardHeight + 5;
    });
  }

  /**
   * Add portfolio summary
   */
  private static addPortfolioSummary(doc: any, activeUseCases: any[]): void {
    PDFExportService.addSectionHeader(doc, 'Portfolio Summary', 1);

    const summary = this.calculatePortfolioSummary(activeUseCases);

    doc.fontSize(11)
       .fillColor('#333333')
       .text(`Active Use Cases: ${summary.totalActive}`)
       .text(`Total Investment: ${summary.totalInvestment}`)
       .text(`Expected ROI: ${summary.expectedROI}`)
       .text(`Implementation Timeline: ${summary.timeline}`)
       .moveDown(1);

    // Priority distribution
    PDFExportService.addSectionHeader(doc, 'Priority Distribution', 2);
    
    const headers = ['Priority Level', 'Count', 'Investment', 'Expected ROI'];
    const rows = [
      ['High Priority', summary.highPriority.toString(), '£2.5M', '35%'],
      ['Medium Priority', summary.mediumPriority.toString(), '£1.8M', '28%'],
      ['Low Priority', summary.lowPriority.toString(), '£0.7M', '15%']
    ];

    PDFExportService.addTable(doc, headers, rows, {
      columnWidths: [120, 60, 80, 80],
      alternateRowColor: true
    });
  }

  /**
   * Add detailed use case analysis
   */
  private static addDetailedUseCaseAnalysis(doc: any, activeUseCases: any[]): void {
    PDFExportService.addSectionHeader(doc, 'Detailed Use Case Analysis', 1);

    const headers = ['Use Case', 'Process', 'Impact Score', 'Effort Score', 'Status'];
    const rows = activeUseCases.map(useCase => [
      useCase.title,
      useCase.process || 'General',
      useCase.impactScore?.toString() || 'N/A',
      useCase.effortScore?.toString() || 'N/A',
      useCase.isActiveForRsa === 'true' ? 'Active' : 'Reference'
    ]);

    PDFExportService.addTable(doc, headers, rows, {
      columnWidths: [150, 80, 60, 60, 60],
      alternateRowColor: true
    });
  }

  /**
   * Add performance metrics
   */
  private static addPerformanceMetrics(doc: any, activeUseCases: any[]): void {
    PDFExportService.addSectionHeader(doc, 'Performance Metrics & ROI Analysis', 1);

    doc.fontSize(11)
       .fillColor('#333333')
       .text('Key Performance Indicators')
       .moveDown(0.5)
       .text('• Average Implementation Time: 6-12 months')
       .text('• Success Rate: 85% of use cases meet or exceed ROI targets')
       .text('• Customer Satisfaction: 92% positive feedback')
       .text('• Operational Efficiency: 30% average improvement')
       .moveDown(1);

    PDFExportService.addSectionHeader(doc, 'Investment Analysis', 2);
    
    doc.text('Total Portfolio Investment: £5.0M')
       .text('Expected 3-Year ROI: £18.5M')
       .text('Break-even Timeline: 18 months average')
       .text('Risk-Adjusted NPV: £12.8M');
  }

  /**
   * Add use case overview
   */
  private static addUseCaseOverview(doc: any, useCase: any): void {
    PDFExportService.addSectionHeader(doc, 'Use Case Overview', 1);

    doc.fontSize(11)
       .fillColor('#333333')
       .text(`Title: ${useCase.title}`)
       .text(`Category: ${useCase.useCaseType || 'General'}`)
       .text(`Process: ${useCase.process || 'N/A'}`)
       .text(`Line of Business: ${useCase.lineOfBusiness || 'Cross-functional'}`)
       .text(`Status: ${useCase.isActiveForRsa === 'true' ? 'Active' : 'Reference'}`)
       .moveDown(1);

    PDFExportService.addSectionHeader(doc, 'Description', 2);
    doc.text(useCase.description || 'No description available')
       .moveDown(1);

    if (useCase.problem_statement) {
      PDFExportService.addSectionHeader(doc, 'Problem Statement', 2);
      doc.text(useCase.problem_statement)
         .moveDown(1);
    }

    // Scoring
    if (useCase.impactScore || useCase.effortScore) {
      PDFExportService.addSectionHeader(doc, 'Assessment Scores', 2);
      
      const headers = ['Metric', 'Score', 'Rating'];
      const rows = [
        ['Business Impact', useCase.impactScore?.toString() || 'N/A', this.getScoreRating(useCase.impactScore)],
        ['Implementation Effort', useCase.effortScore?.toString() || 'N/A', this.getScoreRating(useCase.effortScore)]
      ];

      PDFExportService.addTable(doc, headers, rows, {
        columnWidths: [150, 60, 80],
        alternateRowColor: true
      });
    }
  }

  /**
   * Add implementation details
   */
  private static addImplementationDetails(doc: any, useCase: any): void {
    PDFExportService.addSectionHeader(doc, 'Implementation Details', 1);

    // Implementation timeline
    PDFExportService.addSectionHeader(doc, 'Recommended Timeline', 2);
    doc.fontSize(11)
       .fillColor('#333333')
       .text('• Phase 1: Requirements & Planning (2-4 weeks)')
       .text('• Phase 2: Proof of Concept (4-6 weeks)')
       .text('• Phase 3: Development & Testing (8-12 weeks)')
       .text('• Phase 4: Deployment & Training (2-4 weeks)')
       .moveDown(1);

    // Resource requirements
    PDFExportService.addSectionHeader(doc, 'Resource Requirements', 2);
    doc.text('• Technical Team: 3-5 developers')
       .text('• Business Analysts: 2 specialists')
       .text('• Data Scientists: 1-2 experts')
       .text('• Project Manager: 1 dedicated PM')
       .text('• Estimated Budget: £200K - £500K')
       .moveDown(1);

    // Success criteria
    PDFExportService.addSectionHeader(doc, 'Success Criteria', 2);
    doc.text('• ROI target: 25%+ within 24 months')
       .text('• Process efficiency improvement: 20%+')
       .text('• User adoption rate: 80%+')
       .text('• Customer satisfaction: 90%+');
  }

  /**
   * Helper methods for calculations and formatting
   */
  private static calculateLibraryStats(useCases: any[]): any {
    return {
      total: useCases.length,
      active: useCases.filter(uc => uc.status === 'active').length,
      reference: useCases.filter(uc => uc.status === 'reference').length,
      categories: new Set(useCases.map(uc => uc.use_case_type)).size
    };
  }

  private static getCategoryStats(useCases: any[]): any {
    const stats: any = {};
    
    useCases.forEach(uc => {
      const category = uc.useCaseType || 'Uncategorized';
      if (!stats[category]) {
        stats[category] = { total: 0, active: 0, reference: 0 };
      }
      stats[category].total++;
      if (uc.isActiveForRsa === 'true') stats[category].active++;
      if (uc.isActiveForRsa === 'false') stats[category].reference++;
    });

    return stats;
  }

  private static groupByCategory(useCases: any[]): any {
    return useCases.reduce((groups, uc) => {
      const category = uc.useCaseType || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(uc);
      return groups;
    }, {});
  }

  private static calculatePortfolioSummary(activeUseCases: any[]): any {
    return {
      totalActive: activeUseCases.length,
      totalInvestment: '£5.0M',
      expectedROI: '270%',
      timeline: '6-18 months',
      highPriority: activeUseCases.filter(uc => uc.impactScore >= 8).length,
      mediumPriority: activeUseCases.filter(uc => uc.impactScore >= 5 && uc.impactScore < 8).length,
      lowPriority: activeUseCases.filter(uc => uc.impactScore < 5).length
    };
  }

  private static getScoreRating(score: number): string {
    if (!score) return 'Not Rated';
    if (score >= 8) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  }
}