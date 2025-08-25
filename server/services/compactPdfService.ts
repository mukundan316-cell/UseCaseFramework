import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor, ExtractedUseCaseData } from './useCaseDataExtractor';
import { storage } from '../storage';

export class CompactPdfService {
  private static readonly COLORS = {
    primary: '#005DAA',
    secondary: '#0078D4', 
    text: '#1a1a1a',
    gray: '#666666',
    lightGray: '#999999',
    border: '#E1E1E1',
    background: '#F8F9FA'
  };

  private static readonly FONTS = {
    title: { size: 14, font: 'Helvetica-Bold' },
    heading: { size: 12, font: 'Helvetica-Bold' },
    subheading: { size: 10, font: 'Helvetica-Bold' },
    body: { size: 9, font: 'Helvetica' },
    small: { size: 8, font: 'Helvetica' }
  };

  private static readonly LAYOUT = {
    margin: 30,
    headerHeight: 50,
    lineHeight: 1.3,
    sectionSpacing: 8,
    itemSpacing: 4
  };

  /**
   * Generate compact library export with efficient spacing
   */
  static async generateCompactLibraryPdf(res: Response, filters: any = {}): Promise<void> {
    try {
      const useCases = await storage.getAllUseCases();
      const extractedData = await Promise.all(
        useCases.map(uc => UseCaseDataExtractor.extractUseCaseData(uc))
      );

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: this.LAYOUT.margin, bottom: this.LAYOUT.margin, left: this.LAYOUT.margin, right: this.LAYOUT.margin },
        bufferPages: true
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="RSA-AI-Library-Compact.pdf"');
      doc.pipe(res);

      // Compact cover page
      this.addCompactCoverPage(doc, 'library', { totalUseCases: useCases.length });

      // Strategic use cases section
      const strategicUseCases = extractedData.filter(uc => uc.display.hasScoring);
      if (strategicUseCases.length > 0) {
        doc.addPage();
        this.addCompactSection(doc, 'Strategic Use Cases', strategicUseCases, 'strategic');
      }

      // AI inventory section  
      const aiInventory = extractedData.filter(uc => uc.display.isAiInventory);
      if (aiInventory.length > 0) {
        doc.addPage();
        this.addCompactSection(doc, 'AI Inventory', aiInventory, 'inventory');
      }

      // Industry reference section
      const industryUseCases = extractedData.filter(uc => 
        !uc.display.hasScoring && !uc.display.isAiInventory
      );
      if (industryUseCases.length > 0) {
        doc.addPage();
        this.addCompactSection(doc, 'Industry Reference', industryUseCases, 'reference');
      }

      doc.end();

    } catch (error) {
      console.error('Error generating compact PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  /**
   * Generate compact portfolio PDF
   */
  static async generateCompactPortfolioPdf(res: Response): Promise<void> {
    try {
      const activeUseCases = await storage.getActiveUseCases();
      const extractedData = await Promise.all(
        activeUseCases.map(uc => UseCaseDataExtractor.extractUseCaseData(uc))
      );

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: this.LAYOUT.margin, bottom: this.LAYOUT.margin, left: this.LAYOUT.margin, right: this.LAYOUT.margin }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="RSA-Active-Portfolio-Compact.pdf"');
      doc.pipe(res);

      this.addCompactCoverPage(doc, 'portfolio', { activeUseCases: activeUseCases.length });
      
      if (extractedData.length > 0) {
        doc.addPage();
        this.addCompactSection(doc, 'Active Portfolio', extractedData, 'portfolio');
      }

      doc.end();

    } catch (error) {
      console.error('Error generating compact portfolio PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  /**
   * Generate compact individual use case PDF
   */
  static async generateCompactUseCasePdf(id: string, res: Response): Promise<void> {
    try {
      const useCases = await storage.getAllUseCases();
      const useCase = useCases.find(uc => uc.id === id);
      
      if (!useCase) {
        return res.status(404).json({ error: 'Use case not found' });
      }

      const extractedData = await UseCaseDataExtractor.extractUseCaseData(useCase);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: this.LAYOUT.margin, bottom: this.LAYOUT.margin, left: this.LAYOUT.margin, right: this.LAYOUT.margin }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSA-UseCase-${useCase.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
      doc.pipe(res);

      this.addDetailedUseCasePage(doc, extractedData);

      doc.end();

    } catch (error) {
      console.error('Error generating compact use case PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  /**
   * Compact cover page with minimal white space
   */
  private static addCompactCoverPage(doc: any, type: string, summary: any): void {
    const pageWidth = doc.page.width;
    
    // Thin blue header band
    doc.rect(0, 0, pageWidth, 30).fill(this.COLORS.primary);
    
    // RSA branding (compact)
    doc.fontSize(16).fillColor('#FFFFFF').font('Helvetica-Bold')
       .text('RSA Insurance', this.LAYOUT.margin, 8);
    
    doc.fontSize(8).fillColor('#E8F4FD').font('Helvetica')
       .text('AI Strategy & Prioritization Framework', pageWidth - 200, 12);
    
    // Title section (compact)
    const titles = {
      library: 'Use Case Library',
      portfolio: 'Active AI Portfolio', 
      individual: 'Use Case Analysis'
    };
    
    doc.fontSize(24).fillColor(this.COLORS.text).font('Helvetica-Bold')
       .text(titles[type] || 'AI Framework Report', this.LAYOUT.margin, 60);
    
    // Summary metrics (compact grid)
    const metrics = this.getCompactMetrics(type, summary);
    let yPos = 100;
    
    doc.fontSize(10).fillColor(this.COLORS.gray).font('Helvetica-Bold')
       .text('Executive Summary', this.LAYOUT.margin, yPos);
    
    yPos += 20;
    metrics.forEach((metric, index) => {
      const xPos = this.LAYOUT.margin + (index % 2) * 250;
      if (index % 2 === 0 && index > 0) yPos += 15;
      
      doc.fontSize(9).fillColor(this.COLORS.text).font('Helvetica')
         .text(`${metric.label}: ${metric.value}`, xPos, yPos);
    });
    
    // Date and classification (bottom)
    doc.fontSize(8).fillColor(this.COLORS.lightGray).font('Helvetica')
       .text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, this.LAYOUT.margin, pageWidth - 60)
       .text('Classification: Internal Use', pageWidth - 150, pageWidth - 60);
  }

  /**
   * Compact section with efficient use case layout
   */
  private static addCompactSection(doc: any, title: string, data: ExtractedUseCaseData[], type: string): void {
    // Section header
    doc.fontSize(this.FONTS.heading.size).fillColor(this.COLORS.primary).font(this.FONTS.heading.font)
       .text(title, this.LAYOUT.margin, doc.y);
    
    doc.moveDown(0.3);
    
    // Compact grid layout for use cases
    data.forEach((useCase, index) => {
      this.addCompactUseCaseCard(doc, useCase, type);
      
      // Add page break if needed
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        this.addPageHeader(doc, title);
      }
    });
  }

  /**
   * Very compact use case card with essential info only
   */
  private static addCompactUseCaseCard(doc: any, data: ExtractedUseCaseData, type: string): void {
    const startY = doc.y;
    const cardHeight = type === 'inventory' ? 40 : 50;
    
    // Light background box
    doc.rect(this.LAYOUT.margin, startY, doc.page.width - (this.LAYOUT.margin * 2), cardHeight)
       .fill(this.COLORS.background)
       .stroke(this.COLORS.border);
    
    // Title and description (single line each)
    doc.fontSize(this.FONTS.subheading.size).fillColor(this.COLORS.text).font(this.FONTS.subheading.font)
       .text(this.truncateText(data.basicInfo.title, 50), this.LAYOUT.margin + 5, startY + 5, { 
         width: 300, height: 12, ellipsis: true 
       });
    
    doc.fontSize(this.FONTS.small.size).fillColor(this.COLORS.gray).font(this.FONTS.small.font)
       .text(this.truncateText(data.basicInfo.description, 80), this.LAYOUT.margin + 5, startY + 18, { 
         width: 300, height: 10, ellipsis: true 
       });
    
    // Compact metadata on right side
    const metaX = this.LAYOUT.margin + 320;
    doc.fontSize(this.FONTS.small.size).fillColor(this.COLORS.gray).font(this.FONTS.small.font);
    
    if (type === 'strategic' || type === 'portfolio') {
      // Scoring info (compact)
      doc.text(`Impact: ${data.scoring.finalImpactScore}`, metaX, startY + 5);
      doc.text(`Effort: ${data.scoring.finalEffortScore}`, metaX, startY + 15);
      doc.text(`${data.scoring.finalQuadrant}`, metaX, startY + 25, { width: 120, height: 10, ellipsis: true });
    } else if (type === 'inventory') {
      // AI inventory info (compact)
      doc.text(`Status: ${data.aiInventory.aiInventoryStatus || 'N/A'}`, metaX, startY + 5);
      doc.text(`Deploy: ${data.aiInventory.deploymentStatus || 'N/A'}`, metaX, startY + 15);
    }
    
    // Process and LOB (compact)
    doc.text(`${data.basicInfo.process} | ${data.basicInfo.lineOfBusiness}`, metaX, startY + 35, { 
      width: 150, height: 8, ellipsis: true 
    });
    
    doc.y = startY + cardHeight + this.LAYOUT.itemSpacing;
  }

  /**
   * Detailed single use case page
   */
  private static addDetailedUseCasePage(doc: any, data: ExtractedUseCaseData): void {
    // Title
    doc.fontSize(16).fillColor(this.COLORS.primary).font('Helvetica-Bold')
       .text(data.basicInfo.title, this.LAYOUT.margin, this.LAYOUT.margin + 30);
    
    doc.moveDown(0.5);
    
    // Description
    doc.fontSize(10).fillColor(this.COLORS.text).font('Helvetica')
       .text(data.basicInfo.description, { width: doc.page.width - (this.LAYOUT.margin * 2) });
    
    doc.moveDown(0.8);
    
    // Two-column layout for details
    this.addDetailedSections(doc, data);
  }

  /**
   * Add detailed sections in compact two-column layout
   */
  private static addDetailedSections(doc: any, data: ExtractedUseCaseData): void {
    const leftCol = this.LAYOUT.margin;
    const rightCol = doc.page.width / 2 + 10;
    const colWidth = (doc.page.width / 2) - this.LAYOUT.margin - 10;
    
    // Left column - Basic info
    let leftY = doc.y;
    doc.x = leftCol;
    doc.y = leftY;
    
    this.addCompactInfoSection(doc, 'Business Context', [
      { label: 'Process', value: data.basicInfo.process },
      { label: 'Line of Business', value: data.basicInfo.lineOfBusiness },
      { label: 'Geography', value: data.basicInfo.geography },
      { label: 'Type', value: data.basicInfo.useCaseType }
    ], colWidth);
    
    // Right column - Scoring or governance
    doc.x = rightCol;
    doc.y = leftY;
    
    if (data.display.hasScoring) {
      this.addCompactScoringSection(doc, data, colWidth);
    } else if (data.display.isAiInventory) {
      this.addCompactGovernanceSection(doc, data, colWidth);
    }
  }

  /**
   * Compact info section with minimal spacing
   */
  private static addCompactInfoSection(doc: any, title: string, items: any[], width: number): void {
    doc.fontSize(this.FONTS.subheading.size).fillColor(this.COLORS.primary).font(this.FONTS.subheading.font)
       .text(title, { width });
    
    doc.moveDown(0.2);
    
    items.forEach(item => {
      doc.fontSize(this.FONTS.small.size).fillColor(this.COLORS.gray).font(this.FONTS.small.font)
         .text(`${item.label}: `, { continued: true })
         .fillColor(this.COLORS.text).font('Helvetica')
         .text(item.value || 'N/A', { width });
    });
  }

  /**
   * Compact scoring section
   */
  private static addCompactScoringSection(doc: any, data: ExtractedUseCaseData, width: number): void {
    this.addCompactInfoSection(doc, 'Scoring', [
      { label: 'Impact Score', value: data.scoring.finalImpactScore },
      { label: 'Effort Score', value: data.scoring.finalEffortScore },
      { label: 'Quadrant', value: data.scoring.finalQuadrant },
      { label: 'Revenue Impact', value: `${data.businessValue.revenueImpact}/5` },
      { label: 'Cost Savings', value: `${data.businessValue.costSavings}/5` }
    ], width);
  }

  /**
   * Compact governance section for AI inventory
   */
  private static addCompactGovernanceSection(doc: any, data: ExtractedUseCaseData, width: number): void {
    this.addCompactInfoSection(doc, 'AI Governance', [
      { label: 'Status', value: data.aiInventory.aiInventoryStatus },
      { label: 'Deployment', value: data.aiInventory.deploymentStatus },
      { label: 'Business Function', value: data.aiInventory.businessFunction },
      { label: 'Risk Level', value: data.aiInventory.riskToRsa },
      { label: 'Data Used', value: data.aiInventory.dataUsed }
    ], width);
  }

  /**
   * Simple page header for continuation pages
   */
  private static addPageHeader(doc: any, sectionTitle: string): void {
    doc.fontSize(10).fillColor(this.COLORS.primary).font('Helvetica-Bold')
       .text(`RSA AI Framework - ${sectionTitle}`, this.LAYOUT.margin, this.LAYOUT.margin);
    
    doc.moveDown(0.5);
  }

  /**
   * Get compact metrics for cover page
   */
  private static getCompactMetrics(type: string, summary: any): any[] {
    const base = [
      { label: 'Generated', value: format(new Date(), 'MMM dd, yyyy') },
      { label: 'Framework Version', value: '2.0' }
    ];
    
    if (type === 'library') {
      base.unshift({ label: 'Total Use Cases', value: summary.totalUseCases || 0 });
    } else if (type === 'portfolio') {
      base.unshift({ label: 'Active Initiatives', value: summary.activeUseCases || 0 });
    }
    
    return base;
  }

  /**
   * Truncate text to specified length
   */
  private static truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}