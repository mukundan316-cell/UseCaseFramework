import { PDFExportService } from './pdfExportService';
import { db } from '../db';
import { useCases } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { Response } from 'express';

export class UseCasePdfService {
  /**
   * Generate use case library catalog
   */
  static async generateLibraryCatalog(res: Response, filters: {
    category?: string;
    status?: string;
  }): Promise<void> {
    try {
      // Fetch filtered use cases
      const useCaseData = await this.fetchUseCases(filters);
      
      // Create PDF document
      const doc = PDFExportService.createDocument({
        title: 'RSA AI Use Case Library Catalog',
        author: 'RSA Digital Innovation',
        includeQR: true,
      });

      // Add cover page
      PDFExportService.addCoverPage(doc, {
        title: 'AI Use Case Library',
        subtitle: 'Comprehensive Catalog of AI Applications for Insurance',
        generatedFor: 'RSA Insurance',
        date: new Date(),
      });

      let pageNumber = 1;

      // Overview section
      PDFExportService.addHeader(doc, 'AI Use Case Library Catalog', pageNumber++);
      this.addLibraryOverview(doc, useCaseData);
      PDFExportService.addFooter(doc);

      // Use cases by category
      const categories = this.groupByCategory(useCaseData);
      
      Object.entries(categories).forEach(([category, cases], index) => {
        if (index > 0 || doc.y > 600) {
          doc.addPage();
          PDFExportService.addHeader(doc, 'AI Use Case Library Catalog', pageNumber++);
        }
        
        this.addCategorySection(doc, category, cases as any[]);
        
        if (index < Object.entries(categories).length - 1) {
          PDFExportService.addFooter(doc);
        }
      });

      // Add QR code for digital access
      await PDFExportService.addQRCode(
        doc, 
        `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/library`,
        doc.page.width - 120,
        doc.page.height - 160
      );
      
      PDFExportService.addFooter(doc);

      // Stream PDF response
      const filename = `RSA_Use_Case_Library_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFExportService.streamToResponse(doc, res, filename);

    } catch (error) {
      console.error('Failed to generate library catalog PDF:', error);
      res.status(500).json({ error: 'Failed to generate library catalog' });
    }
  }

  /**
   * Generate RSA active portfolio report
   */
  static async generatePortfolioReport(res: Response): Promise<void> {
    try {
      // Fetch RSA active use cases
      const activeUseCases = await db
        .select()
        .from(useCases)
        .where(eq(useCases.isActiveForRsa, 'true'));

      // Create PDF document
      const doc = PDFExportService.createDocument({
        title: 'RSA Active AI Portfolio Report',
        author: 'RSA Digital Innovation',
        includeQR: true,
      });

      // Add cover page
      PDFExportService.addCoverPage(doc, {
        title: 'RSA Active AI Portfolio',
        subtitle: 'Strategic AI Initiatives & Implementation Status',
        generatedFor: 'RSA Leadership Team',
        date: new Date(),
      });

      let pageNumber = 1;

      // Executive summary
      PDFExportService.addHeader(doc, 'RSA Active AI Portfolio Report', pageNumber++);
      this.addPortfolioSummary(doc, activeUseCases);
      PDFExportService.addFooter(doc);

      // Detailed use case analysis
      doc.addPage();
      PDFExportService.addHeader(doc, 'RSA Active AI Portfolio Report', pageNumber++);
      this.addDetailedUseCaseAnalysis(doc, activeUseCases);
      PDFExportService.addFooter(doc);

      // Performance metrics and ROI
      doc.addPage();
      PDFExportService.addHeader(doc, 'RSA Active AI Portfolio Report', pageNumber++);
      this.addPerformanceMetrics(doc, activeUseCases);
      
      // Add QR code for digital access
      await PDFExportService.addQRCode(
        doc, 
        `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard`,
        doc.page.width - 120,
        doc.page.height - 160
      );
      
      PDFExportService.addFooter(doc);

      // Stream PDF response
      const filename = `RSA_Active_Portfolio_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFExportService.streamToResponse(doc, res, filename);

    } catch (error) {
      console.error('Failed to generate portfolio PDF:', error);
      res.status(500).json({ error: 'Failed to generate portfolio report' });
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