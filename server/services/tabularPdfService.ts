import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor } from './useCaseDataExtractor';
import { storage } from '../storage';

export class TabularPdfService {
  
  /**
   * Generate individual use case PDF
   */
  static async generateIndividualUseCasePdf(id: string, res: Response): Promise<void> {
    try {
      const useCase = await storage.getUseCaseById(id);
      if (!useCase) {
        return res.status(404).json({ error: 'Use case not found' });
      }

      const extractedData = UseCaseDataExtractor.extractCompleteData(useCase);

      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: this.LAYOUT.margin,
          bottom: this.LAYOUT.margin,
          left: this.LAYOUT.margin,
          right: this.LAYOUT.margin
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA-Use-Case-${extractedData.basicInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
      doc.pipe(res);

      this.addIndividualUseCasePage(doc, extractedData);
      doc.end();

    } catch (error) {
      console.error('Error generating individual use case PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
  private static readonly COLORS = {
    primary: '#005DAA',
    secondary: '#0078D4',
    text: '#1a1a1a',
    gray: '#666666',
    lightGray: '#999999',
    border: '#E1E1E1',
    headerBg: '#F0F9FF',
    alternateRow: '#F9FAFB'
  };

  private static readonly FONTS = {
    title: { size: 20, font: 'Helvetica-Bold' },
    header: { size: 10, font: 'Helvetica-Bold' },
    cell: { size: 9, font: 'Helvetica' },
    small: { size: 8, font: 'Helvetica' }
  };

  private static readonly LAYOUT = {
    margin: 30,
    rowHeight: 30,
    headerHeight: 35,
    pageWidth: 842, // A4 landscape
    pageHeight: 595
  };

  /**
   * Generate comprehensive tabular PDF with all use cases
   */
  static async generateTabularLibraryPdf(res: Response, filters: any = {}): Promise<void> {
    try {
      const useCases = await storage.getAllUseCases();
      const extractedData = useCases.map(uc => UseCaseDataExtractor.extractCompleteData(uc));

      // Use landscape orientation for better table layout
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: this.LAYOUT.margin,
          bottom: this.LAYOUT.margin,
          left: this.LAYOUT.margin,
          right: this.LAYOUT.margin
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="RSA-AI-Library-Table.pdf"');
      doc.pipe(res);

      // Cover page
      this.addCoverPage(doc, extractedData.length);

      // Strategic use cases table
      const strategicUseCases = extractedData.filter(uc => uc.display.hasScoring);
      if (strategicUseCases.length > 0) {
        doc.addPage();
        this.addUseCaseTable(doc, strategicUseCases, 'Strategic Use Cases', 'strategic');
      }

      // AI inventory table
      const aiInventory = extractedData.filter(uc => uc.display.isAiInventory);
      if (aiInventory.length > 0) {
        doc.addPage();
        this.addUseCaseTable(doc, aiInventory, 'AI Inventory', 'inventory');
      }

      // Industry reference table
      const industryUseCases = extractedData.filter(uc => 
        !uc.display.hasScoring && !uc.display.isAiInventory
      );
      if (industryUseCases.length > 0) {
        doc.addPage();
        this.addUseCaseTable(doc, industryUseCases, 'Industry Reference', 'reference');
      }

      doc.end();

    } catch (error) {
      console.error('Error generating tabular PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  /**
   * Add professional cover page
   */
  private static addCoverPage(doc: any, totalUseCases: number): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Header band
    doc.rect(0, 0, pageWidth, 80).fill(this.COLORS.primary);

    // RSA branding
    doc.fontSize(28)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text('RSA', 40, 25);

    doc.fontSize(12)
       .fillColor('#E8F4FD')
       .font('Helvetica')
       .text('INSURANCE', 40, 55);

    // Document classification
    doc.fontSize(10)
       .fillColor('#E8F4FD')
       .font('Helvetica-Bold')
       .text('CONFIDENTIAL', pageWidth - 120, 25);

    // Title
    doc.fontSize(36)
       .fillColor(this.COLORS.text)
       .font('Helvetica-Bold')
       .text('AI Use Case Library', 40, 120);

    doc.fontSize(18)
       .fillColor(this.COLORS.primary)
       .font('Helvetica')
       .text('Comprehensive Tabular Overview', 40, 170);

    // Summary box
    const summaryY = 220;
    doc.rect(40, summaryY, pageWidth - 80, 100)
       .fill('#F8F9FA')
       .stroke('#E5E7EB');

    doc.fontSize(14)
       .fillColor(this.COLORS.primary)
       .font('Helvetica-Bold')
       .text('Executive Summary', 60, summaryY + 20);

    doc.fontSize(11)
       .fillColor(this.COLORS.gray)
       .font('Helvetica')
       .text(
         `This report provides a comprehensive tabular view of all ${totalUseCases} AI use cases in the RSA library. ` +
         'Each table includes detailed information about business context, implementation status, and strategic scoring.',
         60, summaryY + 45, { width: pageWidth - 120 }
       );

    // Footer
    doc.fontSize(9)
       .fillColor(this.COLORS.lightGray)
       .font('Helvetica')
       .text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 40, pageHeight - 40);
  }

  /**
   * Add comprehensive use case table
   */
  private static addUseCaseTable(doc: any, useCases: any[], sectionTitle: string, type: string): void {
    this.addPageHeader(doc, sectionTitle, useCases.length);

    const tableY = 80;
    let currentY = tableY;

    // Define columns based on type
    const columns = this.getTableColumns(type);
    const totalWidth = doc.page.width - (this.LAYOUT.margin * 2);
    
    // Calculate column widths proportionally
    const totalColWidth = columns.reduce((sum, col) => sum + col.width, 0);
    columns.forEach(col => {
      col.actualWidth = (col.width / totalColWidth) * totalWidth;
    });

    // Table header
    this.addTableHeader(doc, columns, currentY);
    currentY += this.LAYOUT.headerHeight;

    // Table rows
    useCases.forEach((useCase, index) => {
      // Check if we need a new page
      if (currentY + this.LAYOUT.rowHeight > doc.page.height - 40) {
        doc.addPage();
        this.addPageHeader(doc, `${sectionTitle} (continued)`, useCases.length);
        currentY = 80;
        this.addTableHeader(doc, columns, currentY);
        currentY += this.LAYOUT.headerHeight;
      }

      this.addTableRow(doc, columns, useCase, currentY, index % 2 === 0, type);
      currentY += this.LAYOUT.rowHeight;
    });
  }

  /**
   * Get table columns definition - simplified for better readability
   */
  private static getTableColumns(type: string): any[] {
    if (type === 'strategic') {
      return [
        { key: 'title', header: 'Use Case Title', width: 35 },
        { key: 'process', header: 'Process', width: 20 },
        { key: 'lineOfBusiness', header: 'Line of Business', width: 20 },
        { key: 'impactScore', header: 'Impact', width: 10 },
        { key: 'effortScore', header: 'Effort', width: 10 },
        { key: 'quadrant', header: 'Quadrant', width: 15 },
        { key: 'status', header: 'Status', width: 15 }
      ];
    } else if (type === 'inventory') {
      return [
        { key: 'title', header: 'AI Tool/Model', width: 35 },
        { key: 'businessFunction', header: 'Function', width: 20 },
        { key: 'aiInventoryStatus', header: 'AI Status', width: 15 },
        { key: 'deploymentStatus', header: 'Deployment', width: 15 },
        { key: 'riskLevel', header: 'Risk Level', width: 20 }
      ];
    } else {
      return [
        { key: 'title', header: 'Use Case Title', width: 40 },
        { key: 'process', header: 'Process', width: 25 },
        { key: 'lineOfBusiness', header: 'Line of Business', width: 25 },
        { key: 'librarySource', header: 'Source', width: 15 }
      ];
    }
  }

  /**
   * Add table header row
   */
  private static addTableHeader(doc: any, columns: any[], y: number): void {
    let currentX = this.LAYOUT.margin;

    // Header background
    doc.rect(this.LAYOUT.margin, y, doc.page.width - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight)
       .fill(this.COLORS.headerBg)
       .stroke(this.COLORS.border);

    // Header text
    columns.forEach(col => {
      doc.fontSize(this.FONTS.header.size)
         .fillColor(this.COLORS.text)
         .font(this.FONTS.header.font)
         .text(col.header, currentX + 4, y + 10, {
           width: col.actualWidth - 8,
           height: this.LAYOUT.headerHeight - 8,
           ellipsis: true
         });

      // Column border
      doc.moveTo(currentX, y)
         .lineTo(currentX, y + this.LAYOUT.headerHeight)
         .stroke(this.COLORS.border);

      currentX += col.actualWidth;
    });
  }

  /**
   * Add table data row
   */
  private static addTableRow(doc: any, columns: any[], useCase: any, y: number, isEven: boolean, type: string): void {
    let currentX = this.LAYOUT.margin;

    // Row background
    const bgColor = isEven ? '#FFFFFF' : this.COLORS.alternateRow;
    doc.rect(this.LAYOUT.margin, y, doc.page.width - (this.LAYOUT.margin * 2), this.LAYOUT.rowHeight)
       .fill(bgColor)
       .stroke(this.COLORS.border);

    // Row data
    columns.forEach(col => {
      const value = this.getCellValue(useCase, col.key, type);
      
      doc.fontSize(this.FONTS.cell.size)
         .fillColor(this.COLORS.text)
         .font(this.FONTS.cell.font)
         .text(value, currentX + 4, y + 8, {
           width: col.actualWidth - 8,
           height: this.LAYOUT.rowHeight - 8,
           ellipsis: true
         });

      // Column border
      doc.moveTo(currentX, y)
         .lineTo(currentX, y + this.LAYOUT.rowHeight)
         .stroke(this.COLORS.border);

      currentX += col.actualWidth;
    });
  }

  /**
   * Get cell value for specific column
   */
  private static getCellValue(useCase: any, key: string, type: string): string {
    switch (key) {
      case 'title':
        return this.truncateText(useCase.basicInfo.title, 30);
      case 'description':
        return this.truncateText(useCase.basicInfo.description, 50);
      case 'process':
        return useCase.basicInfo.process || '';
      case 'lineOfBusiness':
        return useCase.basicInfo.lineOfBusiness || '';
      case 'useCaseType':
        return useCase.basicInfo.useCaseType || '';
      case 'status':
        return useCase.implementation.useCaseStatus || useCase.portfolioStatus.libraryTier || '';
      case 'impactScore':
        return useCase.display.hasScoring ? useCase.scoring.finalImpactScore.toFixed(1) : '';
      case 'effortScore':
        return useCase.display.hasScoring ? useCase.scoring.finalEffortScore.toFixed(1) : '';
      case 'quadrant':
        return useCase.display.hasScoring ? useCase.scoring.finalQuadrant : '';
      case 'revenueImpact':
        return useCase.display.hasScoring ? `${useCase.businessValue.revenueImpact}/5` : '';
      case 'strategicFit':
        return useCase.display.hasScoring ? `${useCase.businessValue.strategicFit}/5` : '';
      case 'aiInventoryStatus':
        return useCase.aiInventory.aiInventoryStatus || '';
      case 'deploymentStatus':
        return useCase.aiInventory.deploymentStatus || '';
      case 'businessFunction':
        return useCase.aiInventory.businessFunction || '';
      case 'riskLevel':
        return useCase.aiInventory.riskToRsa || '';
      case 'geography':
        return useCase.basicInfo.geography || '';
      case 'businessSegment':
        return useCase.basicInfo.businessSegment || '';
      case 'librarySource':
        return useCase.portfolioStatus.librarySource || '';
      default:
        return '';
    }
  }

  /**
   * Add page header
   */
  private static addPageHeader(doc: any, title: string, count: number): void {
    doc.fontSize(14)
       .fillColor(this.COLORS.primary)
       .font('Helvetica-Bold')
       .text(title, this.LAYOUT.margin, 30);

    doc.fontSize(10)
       .fillColor(this.COLORS.gray)
       .font('Helvetica')
       .text(`${count} use cases`, this.LAYOUT.margin, 50);

    // Page number
    doc.fontSize(9)
       .fillColor(this.COLORS.lightGray)
       .font('Helvetica')
       .text(`Page ${doc.bufferedPageRange().count}`, doc.page.width - 80, 30);
  }

  /**
   * Add individual use case page
   */
  private static addIndividualUseCasePage(doc: any, useCase: any): void {
    // Header with RSA branding
    doc.rect(0, 0, doc.page.width, 60).fill(this.COLORS.primary);
    
    doc.fontSize(24)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text('RSA', this.LAYOUT.margin, 20);

    doc.fontSize(10)
       .fillColor('#E8F4FD')
       .font('Helvetica')
       .text('AI Use Case Analysis', this.LAYOUT.margin, 45);

    // Title
    doc.fontSize(18)
       .fillColor(this.COLORS.text)
       .font('Helvetica-Bold')
       .text(useCase.basicInfo.title, this.LAYOUT.margin, 80, {
         width: doc.page.width - (this.LAYOUT.margin * 2)
       });

    // Description
    doc.fontSize(11)
       .fillColor(this.COLORS.gray)
       .font('Helvetica')
       .text(useCase.basicInfo.description, this.LAYOUT.margin, 110, {
         width: doc.page.width - (this.LAYOUT.margin * 2),
         lineGap: 4
       });

    let currentY = 160;

    // Basic Information Section
    currentY = this.addInfoSection(doc, 'Business Context', [
      ['Process', useCase.basicInfo.process],
      ['Line of Business', useCase.basicInfo.lineOfBusiness],
      ['Business Segment', useCase.basicInfo.businessSegment],
      ['Geography', useCase.basicInfo.geography],
      ['Use Case Type', useCase.basicInfo.useCaseType],
      ['Status', useCase.implementation.useCaseStatus || 'Not Set']
    ], currentY);

    // Scoring Section (if available)
    if (useCase.display.hasScoring) {
      currentY = this.addInfoSection(doc, 'RSA Framework Scoring', [
        ['Impact Score', `${useCase.scoring.finalImpactScore}/10`],
        ['Effort Score', `${useCase.scoring.finalEffortScore}/10`],
        ['Strategic Quadrant', useCase.scoring.finalQuadrant],
        ['Revenue Impact', `${useCase.businessValue.revenueImpact}/5`],
        ['Cost Savings', `${useCase.businessValue.costSavings}/5`],
        ['Risk Reduction', `${useCase.businessValue.riskReduction}/5`],
        ['Strategic Fit', `${useCase.businessValue.strategicFit}/5`]
      ], currentY);
    }

    // AI Inventory Section (if available)
    if (useCase.display.isAiInventory) {
      const aiFields = [
        ['AI Inventory Status', useCase.aiInventory.aiInventoryStatus],
        ['Deployment Status', useCase.aiInventory.deploymentStatus],
        ['Business Function', useCase.aiInventory.businessFunction],
        ['Risk to RSA', useCase.aiInventory.riskToRsa],
        ['Risk to Customers', useCase.aiInventory.riskToCustomers],
        ['Model Owner', useCase.aiInventory.modelOwner]
      ].filter(([_, value]) => value);

      if (aiFields.length > 0) {
        currentY = this.addInfoSection(doc, 'AI Governance', aiFields, currentY);
      }
    }

    // Implementation Details
    const implFields = [
      ['Primary Business Owner', useCase.implementation.primaryBusinessOwner],
      ['Implementation Timeline', useCase.implementation.implementationTimeline],
      ['Estimated Value', useCase.implementation.estimatedValue],
      ['Success Metrics', useCase.implementation.successMetrics],
      ['Key Dependencies', useCase.implementation.keyDependencies]
    ].filter(([_, value]) => value);

    if (implFields.length > 0) {
      this.addInfoSection(doc, 'Implementation Details', implFields, currentY);
    }
  }

  /**
   * Add information section with key-value pairs
   */
  private static addInfoSection(doc: any, title: string, items: string[][], startY: number): number {
    let currentY = startY + 20;

    // Section title
    doc.fontSize(14)
       .fillColor(this.COLORS.primary)
       .font('Helvetica-Bold')
       .text(title, this.LAYOUT.margin, currentY);

    currentY += 25;

    // Items
    items.forEach(([key, value]) => {
      if (value) {
        doc.fontSize(10)
           .fillColor(this.COLORS.text)
           .font('Helvetica-Bold')
           .text(`${key}:`, this.LAYOUT.margin, currentY, { continued: true })
           .font('Helvetica')
           .fillColor(this.COLORS.gray)
           .text(` ${value}`, { width: doc.page.width - (this.LAYOUT.margin * 2) });
        
        currentY += 18;
      }
    });

    return currentY;
  }

  /**
   * Truncate text to fit in cell
   */
  private static truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}