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
      
      doc.rect(60, doc.y, 120, 25).fill(statusColor);
      doc.fontSize(10)
         .fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .text(statusText, 70, doc.y + 8);
      
      doc.y += 35;
      doc.moveDown(1);
      
      // Description
      doc.fontSize(12)
         .fillColor('#333333')
         .font('Helvetica-Bold')
         .text('Description');
      
      doc.fontSize(11)
         .fillColor('#666666')
         .font('Helvetica')
         .text(useCase.description || 'No description available', { width: 480 });
      
      doc.moveDown(1);
      
      // Problem Statement if available
      if (useCase.problemStatement) {
        doc.fontSize(12)
           .fillColor('#333333')
           .font('Helvetica-Bold')
           .text('Problem Statement');
        
        doc.fontSize(11)
           .fillColor('#666666')
           .font('Helvetica')
           .text(useCase.problemStatement, { width: 480 });
        
        doc.moveDown(1);
      }

      // Add footer
      this.addPageFooter(doc);

      doc.end();
      console.log('Individual use case report generated successfully');

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
          this.addUseCaseCard(doc, useCase, index);
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
          this.addUseCaseCard(doc, useCase, index);
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