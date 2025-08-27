import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor } from './useCaseDataExtractor';
import { storage } from '../storage';

export class TabularPdfService {
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
    title: { size: 16, font: 'Helvetica-Bold' },
    header: { size: 8, font: 'Helvetica-Bold' },
    cell: { size: 7, font: 'Helvetica' },
    small: { size: 6, font: 'Helvetica' }
  };

  private static readonly LAYOUT = {
    margin: 20,
    rowHeight: 25,
    headerHeight: 30,
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
   * Get table columns definition based on type
   */
  private static getTableColumns(type: string): any[] {
    const baseColumns = [
      { key: 'title', header: 'Title', width: 25 },
      { key: 'description', header: 'Description', width: 30 },
      { key: 'process', header: 'Process', width: 15 },
      { key: 'lineOfBusiness', header: 'Line of Business', width: 15 },
      { key: 'useCaseType', header: 'Type', width: 12 },
      { key: 'status', header: 'Status', width: 12 }
    ];

    if (type === 'strategic') {
      return [
        ...baseColumns,
        { key: 'impactScore', header: 'Impact', width: 8 },
        { key: 'effortScore', header: 'Effort', width: 8 },
        { key: 'quadrant', header: 'Quadrant', width: 12 },
        { key: 'revenueImpact', header: 'Revenue', width: 8 },
        { key: 'strategicFit', header: 'Strategy', width: 8 }
      ];
    } else if (type === 'inventory') {
      return [
        ...baseColumns,
        { key: 'aiInventoryStatus', header: 'AI Status', width: 12 },
        { key: 'deploymentStatus', header: 'Deployment', width: 12 },
        { key: 'businessFunction', header: 'Function', width: 15 },
        { key: 'riskLevel', header: 'Risk Level', width: 10 }
      ];
    } else {
      return [
        ...baseColumns,
        { key: 'geography', header: 'Geography', width: 12 },
        { key: 'businessSegment', header: 'Segment', width: 15 },
        { key: 'librarySource', header: 'Source', width: 12 }
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
         .text(col.header, currentX + 2, y + 8, {
           width: col.actualWidth - 4,
           height: this.LAYOUT.headerHeight - 4,
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
         .text(value, currentX + 2, y + 6, {
           width: col.actualWidth - 4,
           height: this.LAYOUT.rowHeight - 4,
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
   * Truncate text to fit in cell
   */
  private static truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}