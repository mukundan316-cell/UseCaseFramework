import PDFDocument from 'pdfkit';
import { db } from '../db';
import { useCases } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor, ExtractedUseCaseData } from './useCaseDataExtractor';

export class EnhancedUseCasePdfService {
  /**
   * Professional cover page with RSA branding
   */
  private static addProfessionalCoverPage(doc: any, type: 'library' | 'portfolio' | 'individual', summary: any): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Clean white background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFFFFF');
    
    // Top blue header band (matching your examples)
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
    
    // Main content based on type
    let title = '';
    let subtitle = '';
    let description = '';
    
    switch (type) {
      case 'library':
        title = 'Use Case Library';
        subtitle = 'Comprehensive AI Opportunity Catalog';
        description = 'This catalog presents a comprehensive library of AI use cases specifically curated for RSA Insurance. Each initiative has been evaluated for strategic alignment, feasibility, resource requirements, and expected business impact to ensure optimal allocation of resources.';
        break;
      case 'portfolio':
        title = 'RSA AI Portfolio';
        subtitle = 'Active Strategic Implementation Portfolio';
        description = 'Current portfolio of approved AI initiatives actively under development and implementation across RSA business units, representing strategic priorities for digital transformation.';
        break;
      case 'individual':
        title = 'Use Case Analysis';
        subtitle = 'Detailed Strategic Assessment';
        description = 'Comprehensive analysis of AI use case including business impact assessment, technical requirements, implementation roadmap, and strategic alignment with organizational objectives.';
        break;
    }
    
    // Title section (consistent with your examples)
    doc.fontSize(42)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text(title, 60, 140, { width: pageWidth - 120, lineGap: 8 });
    
    doc.fontSize(20)
       .fillColor('#005DAA')
       .font('Helvetica')
       .text(subtitle, 60, 190, { width: pageWidth - 120 });
    
    // Executive summary box (matching your layout)
    const summaryY = 250;
    doc.rect(60, summaryY, pageWidth - 120, 80)
       .fill('#F8F9FA')
       .stroke('#E5E7EB');
    
    doc.fontSize(14)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text('Executive Summary', 80, summaryY + 20);
    
    doc.fontSize(11)
       .fillColor('#666666')
       .font('Helvetica')
       .text(description, 80, summaryY + 45, { width: pageWidth - 160, lineGap: 4 });
    
    // Portfolio metrics section (matching your stats layout)
    const metricsY = 360;
    
    // Metrics in three columns with background boxes
    const col1X = 60;
    const col2X = 220;
    const col3X = 380;
    const colWidth = 140;
    const colHeight = 80;
    
    // Strategic Use Cases
    doc.rect(col1X, metricsY, colWidth, colHeight).fill('#F0F9FF').stroke('#E0E7FF');
    doc.fontSize(36)
       .fillColor('#005DAA')
       .font('Helvetica-Bold')
       .text(summary.strategicUseCases.toString(), col1X + 20, metricsY + 15);
    doc.fontSize(12)
       .fillColor('#666666')
       .font('Helvetica')
       .text('Strategic Use Cases', col1X + 20, metricsY + 55);
    
    // Active Portfolio (highlighted in green)
    doc.rect(col2X, metricsY, colWidth, colHeight).fill('#F0FDF4').stroke('#BBF7D0');
    doc.fontSize(36)
       .fillColor('#22C55E')
       .font('Helvetica-Bold')
       .text(summary.activeUseCases.toString(), col2X + 20, metricsY + 15);
    doc.fontSize(12)
       .fillColor('#666666')
       .font('Helvetica')
       .text('Active Portfolio', col2X + 20, metricsY + 55);
    
    // AI Inventory
    doc.rect(col3X, metricsY, colWidth, colHeight).fill('#FEF3C7').stroke('#F59E0B');
    doc.fontSize(36)
       .fillColor('#D97706')
       .font('Helvetica-Bold')
       .text(summary.aiInventoryItems.toString(), col3X + 20, metricsY + 15);
    doc.fontSize(12)
       .fillColor('#666666')
       .font('Helvetica')
       .text('AI Inventory', col3X + 20, metricsY + 55);
    
    // Footer metadata
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Organization: RSA Insurance`, 60, 480)
       .text(`Report Generated: ${format(new Date(), 'EEEE, MMMM d, yyyy')}`, 60, 495);
    
    // Professional footer
    doc.fontSize(9)
       .fillColor('#999999')
       .font('Helvetica')
       .text('RSA Digital Innovation | AI Use Case Value Framework', 60, pageHeight - 50)
       .text('Page 1', pageWidth - 80, pageHeight - 50);
  }

  /**
   * Add professional page header
   */
  private static addPageHeader(doc: any, title: string, pageNum: number): void {
    const pageWidth = doc.page.width;
    
    // Top blue line
    doc.rect(0, 0, pageWidth, 4).fill('#005DAA');
    
    // Header content with proper spacing
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
   * Add professional use case table with all captured details
   */
  private static addUseCaseTable(doc: any, rawUseCase: any, index: number): void {
    // Extract structured data
    const useCase = UseCaseDataExtractor.extractCompleteData(rawUseCase);
    const startY = doc.y;
    const tableWidth = 480;
    const leftMargin = 60;
    
    // Check if we need a new page
    if (startY > 600) {
      doc.addPage();
      this.addPageHeader(doc, 'AI Use Case Library', Math.ceil(doc.pageNumber));
      doc.y = 80;
    }
    
    // Use case header with color coding
    const headerY = doc.y + 20;
    const headerColor = useCase.display.statusColor;
    const statusText = useCase.display.statusBadge;
    
    // Header rectangle
    doc.rect(leftMargin, headerY, tableWidth, 50)
       .fill(headerColor)
       .fillColor('#FFFFFF');
    
    // Use case number and title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`${index}. ${useCase.basicInfo.title}`, leftMargin + 20, headerY + 12);
    
    // Status badge
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(statusText, leftMargin + tableWidth - 120, headerY + 30);
    
    doc.y = headerY + 70;
    
    // Description section
    doc.fillColor('#333333')
       .fontSize(11)
       .font('Helvetica')
       .text(useCase.basicInfo.description, leftMargin + 20, doc.y, { 
         width: tableWidth - 40, 
         lineGap: 4 
       });
    
    doc.y += 30;
    
    // Problem statement if available
    if (useCase.basicInfo.problemStatement) {
      doc.fontSize(12)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Problem Statement:', leftMargin + 20, doc.y);
      
      doc.y += 15;
      
      doc.fontSize(11)
         .fillColor('#333333')
         .font('Helvetica')
         .text(useCase.basicInfo.problemStatement, leftMargin + 20, doc.y, { 
           width: tableWidth - 40, 
           lineGap: 4 
         });
      
      doc.y += 25;
    }
    
    // Details table
    const tableY = doc.y;
    const rowHeight = 25;
    const col1Width = 140;
    const col2Width = 140;
    const col3Width = 200;
    
    // Table header
    doc.rect(leftMargin, tableY, tableWidth, rowHeight)
       .fill('#F8F9FA')
       .stroke('#E5E7EB');
    
    doc.fontSize(11)
       .fillColor('#374151')
       .font('Helvetica-Bold')
       .text('Category', leftMargin + 10, tableY + 7)
       .text('Details', leftMargin + col1Width + 10, tableY + 7)
       .text('Scores & Metrics', leftMargin + col1Width + col2Width + 10, tableY + 7);
    
    // Table rows with structured data
    let currentY = tableY + rowHeight;
    const rows = [
      ['Process', useCase.multiSelectData.processes?.[0] || useCase.basicInfo.process || '', useCase.display.hasScoring ? `Impact: ${useCase.scoring.finalImpactScore.toFixed(1)} / 10` : 'Governance Only'],
      ['Line of Business', useCase.multiSelectData.linesOfBusiness?.[0] || useCase.basicInfo.lineOfBusiness || '', useCase.display.hasScoring ? `Effort: ${useCase.scoring.finalEffortScore.toFixed(1)} / 10` : useCase.aiInventory.aiInventoryStatus || 'N/A'],
      ['Use Case Type', useCase.basicInfo.useCaseType, useCase.display.hasScoring ? `Quadrant: ${useCase.scoring.finalQuadrant}` : useCase.aiInventory.deploymentStatus || 'N/A'],
      ['Business Unit', useCase.multiSelectData.businessSegments?.[0] || useCase.basicInfo.businessSegment || '', useCase.display.hasScoring ? `Revenue Impact: ${useCase.businessValue.revenueImpact} / 5` : useCase.aiInventory.businessFunction || 'N/A'],
      ['Geography', useCase.multiSelectData.geographies?.[0] || useCase.basicInfo.geography || '', useCase.display.hasScoring ? `Risk Reduction: ${useCase.businessValue.riskReduction} / 5` : useCase.aiInventory.modelOwner || 'N/A'],
      ['Status', useCase.implementation.useCaseStatus || useCase.portfolioStatus.libraryTier, useCase.display.hasScoring ? `Strategic Fit: ${useCase.businessValue.strategicFit} / 5` : useCase.aiInventory.informedBy || 'N/A']
    ];
    
    rows.forEach((row, rowIndex) => {
      const bgColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
      
      // Row background
      doc.rect(leftMargin, currentY, tableWidth, rowHeight)
         .fill(bgColor)
         .stroke('#E5E7EB');
      
      // Row content
      doc.fontSize(10)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text(row[0], leftMargin + 10, currentY + 8);
      
      doc.fontSize(10)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text(row[1], leftMargin + col1Width + 10, currentY + 8)
         .text(row[2], leftMargin + col1Width + col2Width + 10, currentY + 8);
      
      currentY += rowHeight;
    });
    
    // Implementation details if available
    const hasImplementationDetails = useCase.implementation.implementationTimeline || 
                                   useCase.implementation.estimatedValue ||
                                   useCase.aiInventory.riskToCustomers ||
                                   useCase.aiInventory.riskToRsa;
    
    if (hasImplementationDetails) {
      doc.y = currentY + 15;
      
      doc.fontSize(12)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text(useCase.display.isAiInventory ? 'Governance Details:' : 'Implementation Details:', leftMargin + 20, doc.y);
      
      doc.y += 20;
      
      if (useCase.display.isAiInventory) {
        // AI Inventory governance details
        if (useCase.aiInventory.riskToCustomers) {
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica')
             .text(`Risk to Customers: ${useCase.aiInventory.riskToCustomers}`, leftMargin + 20, doc.y, { width: tableWidth - 40 });
          doc.y += 15;
        }
        if (useCase.aiInventory.riskToRsa) {
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica')
             .text(`Risk to RSA: ${useCase.aiInventory.riskToRsa}`, leftMargin + 20, doc.y, { width: tableWidth - 40 });
          doc.y += 15;
        }
        if (useCase.aiInventory.dataUsed) {
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica')
             .text(`Data Used: ${useCase.aiInventory.dataUsed}`, leftMargin + 20, doc.y, { width: tableWidth - 40 });
          doc.y += 15;
        }
      } else {
        // Strategic use case implementation details
        if (useCase.implementation.implementationTimeline) {
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica')
             .text(`Timeline: ${useCase.implementation.implementationTimeline}`, leftMargin + 20, doc.y);
          doc.y += 15;
        }
        if (useCase.implementation.estimatedValue) {
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica')
             .text(`Estimated Value: ${useCase.implementation.estimatedValue}`, leftMargin + 20, doc.y);
          doc.y += 15;
        }
      }
    }
    
    doc.y = currentY + 30; // Space between use cases
  }

  /**
   * Add professional footer
   */
  private static addPageFooter(doc: any, pageNum: number): void {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    
    // Footer separator
    doc.moveTo(60, pageHeight - 60)
       .lineTo(pageWidth - 60, pageHeight - 60)
       .stroke('#E5E7EB');
    
    // Footer content
    doc.fontSize(9)
       .fillColor('#6B7280')
       .font('Helvetica')
       .text('RSA Digital Innovation | AI Use Case Value Framework', 60, pageHeight - 45);
    
    doc.fontSize(9)
       .fillColor('#9CA3AF')
       .text(`Generated ${format(new Date(), 'MMM d, yyyy')} | Page ${pageNum}`, pageWidth - 200, pageHeight - 45);
  }

  /**
   * Generate enhanced use case library catalog
   */
  static async generateLibraryCatalog(res: Response, filters: {
    category: string;
    status: string;
  }): Promise<void> {
    try {
      console.log('Generating enhanced library catalog with filters:', filters);
      
      // Fetch use cases based on filters
      let allUseCases;
      if (filters.status === 'active') {
        allUseCases = await db.select().from(useCases).where(eq(useCases.isActiveForRsa, 'true'));
      } else if (filters.status === 'reference') {
        allUseCases = await db.select().from(useCases).where(eq(useCases.isActiveForRsa, 'false'));
      } else {
        allUseCases = await db.select().from(useCases);
      }
      console.log('Found use cases:', allUseCases.length);
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Use_Case_Library_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      doc.pipe(res);

      // Calculate summary using data extractor
      const summary = UseCaseDataExtractor.getSummaryStats(allUseCases);

      // PAGE 1: Professional Cover Page
      this.addProfessionalCoverPage(doc, 'library', summary);
      
      // PAGE 2: Executive Summary
      doc.addPage();
      this.addPageHeader(doc, 'AI Use Case Library', 2);
      doc.y = 80;
      
      doc.fontSize(18)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Executive Summary');
      
      doc.y += 25;
      
      doc.fontSize(12)
         .fillColor('#374151')
         .font('Helvetica')
         .text('This catalog presents a comprehensive library of AI use cases specifically curated for the insurance sector, with particular focus on RSA\'s strategic alignment and expected business impact. Each use case has been evaluated for feasibility, resource requirements, and potential ROI to ensure optimal allocation of resources.', { 
           width: 480, 
           lineGap: 6 
         });
      
      doc.y += 40;
      
      // Use Case Inventory section (matching your layout)
      doc.fontSize(18)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Use Case Inventory');
      
      doc.y += 20;
      
      // Start adding use cases with professional tables
      allUseCases.forEach((useCase, index) => {
        this.addUseCaseTable(doc, useCase, index + 1);
      });

      // Add footer to final page
      this.addPageFooter(doc, 1);

      doc.end();
      console.log('Enhanced library catalog generated successfully');

    } catch (error) {
      console.error('Failed to generate enhanced library catalog:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate library catalog' });
      }
    }
  }

  /**
   * Generate enhanced portfolio report
   */
  static async generatePortfolioReport(res: Response): Promise<void> {
    try {
      console.log('Generating enhanced portfolio report');
      
      // Fetch active use cases only
      const activeUseCases = await db
        .select()
        .from(useCases)
        .where(eq(useCases.isActiveForRsa, 'true'));

      console.log('Found active use cases:', activeUseCases.length);
      
      // Create professional PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA_Active_Portfolio_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      
      doc.pipe(res);

      // Calculate summary using data extractor
      const allUseCases = await db.select().from(useCases);
      const summary = UseCaseDataExtractor.getSummaryStats(allUseCases);

      // PAGE 1: Professional Cover Page
      this.addProfessionalCoverPage(doc, 'portfolio', summary);
      
      // PAGE 2: Portfolio Overview
      doc.addPage();
      this.addPageHeader(doc, 'RSA AI Portfolio', 2);
      doc.y = 80;
      
      doc.fontSize(18)
         .fillColor('#005DAA')
         .font('Helvetica-Bold')
         .text('Portfolio Overview');
      
      doc.y += 25;
      
      doc.fontSize(12)
         .fillColor('#374151')
         .font('Helvetica')
         .text(`This portfolio represents RSA's current active AI initiatives under development and implementation. These ${activeUseCases.length} strategic use cases have been approved for investment and are being actively pursued across our business units to drive digital transformation and competitive advantage.`, { 
           width: 480, 
           lineGap: 6 
         });
      
      doc.y += 40;
      
      // Add active use cases with enhanced tables
      activeUseCases.forEach((useCase, index) => {
        this.addUseCaseTable(doc, useCase, index + 1);
      });

      // Add footer to final page
      this.addPageFooter(doc, 1);

      doc.end();
      console.log('Enhanced portfolio report generated successfully');

    } catch (error) {
      console.error('Failed to generate enhanced portfolio report:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate portfolio report' });
      }
    }
  }
}