import { jsPDF } from "jspdf";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { RandomSelection } from "@shared/schema";

export interface PDFGenerationOptions {
  title: string;
  generatedDate: Date;
  selections: RandomSelection[];
}

export class PDFGenerator {
  private static s3Client = new S3Client({ 
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1' 
  });

  static async generateReport(options: PDFGenerationOptions): Promise<Buffer> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let currentY = margin;
    let pageNumber = 1;
    
    // Group selections by route
    const groupedSelections = this.groupSelectionsByRoute(options.selections);
    
    // Add header with GMX logo space and title
    this.addHeader(doc, pageWidth, margin);
    currentY = 55;
    
    for (const [route, selections] of Array.from(groupedSelections.entries())) {
      let itemNumber = 1; // Reset numbering for each route
      
      // Check if we need a new page
      if (currentY > pageHeight - 60) {
        this.addFooter(doc, options.generatedDate, pageNumber, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        this.addHeader(doc, pageWidth, margin);
        this.addTableHeader(doc, margin, 55);
        currentY = 65;
      }
      
      // Add table header if this is the first route on the page
      if (currentY === 55 || currentY === 65) {
        this.addTableHeader(doc, margin, currentY);
        currentY += 10;
      }
      
      // Add main points
      const mainPoints = selections.filter((s: RandomSelection) => s.selType === 'Main');
      const altPoints = selections.filter((s: RandomSelection) => s.selType.startsWith('X'));
      
      // Add navy blue separator line for each route (except first)
      if (route !== Array.from(groupedSelections.keys())[0]) {
        doc.setDrawColor(45, 104, 196); // Navy blue #2D68C4
        doc.setLineWidth(0.5);
        doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
        currentY += 4;
      }
      
      for (let i = 0; i < mainPoints.length; i++) {
        const selection = mainPoints[i];
        const showRoute = i === 0; // Only show route number on first occurrence
        const showDir = i === 0; // Only show direction on first occurrence
        
        this.addTableRow(doc, margin, currentY, itemNumber, showRoute ? route : '', 
                        showDir ? selection.dir : '', selection.selType, selection.milepost);
        currentY += lineHeight;
        itemNumber++;
        
        // Check page break
        if (currentY > pageHeight - 60) {
          this.addFooter(doc, options.generatedDate, pageNumber, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          this.addHeader(doc, pageWidth, margin);
          this.addTableHeader(doc, margin, 55);
          currentY = 65;
        }
      }
      
      // Add alternate points
      for (const altPoint of altPoints) {
        this.addTableRow(doc, margin, currentY, itemNumber, '', 
                        '', altPoint.selType, altPoint.milepost);
        currentY += lineHeight;
        itemNumber++;
        
        // Check page break
        if (currentY > pageHeight - 60) {
          this.addFooter(doc, options.generatedDate, pageNumber, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          this.addHeader(doc, pageWidth, margin);
          this.addTableHeader(doc, margin, 55);
          currentY = 65;
        }
      }
    }
    
    // Add final footer
    this.addFooter(doc, options.generatedDate, pageNumber, pageWidth, pageHeight);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Store in S3 for persistence
    await this.storeReportInS3(pdfBuffer, options.title);
    
    return pdfBuffer;
  }
  
  private static groupSelectionsByRoute(selections: RandomSelection[]): Map<string, RandomSelection[]> {
    const grouped = new Map<string, RandomSelection[]>();
    
    for (const selection of selections) {
      const key = selection.route.toString();
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(selection);
    }
    
    // Sort each route's selections
    for (const [route, routeSelections] of Array.from(grouped.entries())) {
      routeSelections.sort((a: RandomSelection, b: RandomSelection) => {
        if (a.selType === 'Main' && b.selType !== 'Main') return -1;
        if (a.selType !== 'Main' && b.selType === 'Main') return 1;
        return a.milepost - b.milepost;
      });
    }
    
    return grouped;
  }
  
  private static addHeader(doc: jsPDF, pageWidth: number, margin: number) {
    // Add navy blue header border
    doc.setDrawColor(45, 104, 196); // Navy blue #2D68C4
    doc.setFillColor(45, 104, 196);
    doc.setLineWidth(2);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Add GMX text in light gray with opacity
    doc.setTextColor(220, 220, 220); // Light gray
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('GMX', margin, 20);
    
    // Add title below header with proper spacing
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Random Point Report', margin, 45);
  }
  
  private static addTableHeader(doc: jsPDF, margin: number, y: number) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Table headers
    doc.text('No.', margin + 5, y);
    doc.text('Route', margin + 25, y);
    doc.text('Dir', margin + 65, y);
    doc.text('SelType', margin + 95, y);
    doc.text('MilePost', margin + 135, y);
  }
  
  private static addTableRow(doc: jsPDF, margin: number, y: number, no: number, 
                            route: string, dir: string, selType: string, milepost: number) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Right-align the number
    doc.text(no.toString(), margin + 15, y, { align: 'right' });
    doc.text(route, margin + 25, y);
    doc.text(dir, margin + 65, y);
    doc.text(selType, margin + 95, y);
    doc.text(milepost.toFixed(2), margin + 135, y);
  }
  
  private static addFooter(doc: jsPDF, date: Date, pageNumber: number, pageWidth: number, pageHeight: number) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const footerText = `${dayName}, ${monthName} ${day}, ${year} – Page ${pageNumber}`;
    
    // Center the footer text
    const textWidth = doc.getTextWidth(footerText);
    const x = (pageWidth - textWidth) / 2;
    
    doc.text(footerText, x, pageHeight - 20);
  }

  static async generateExcel(selections: RandomSelection[]): Promise<Buffer> {
    // In a real implementation, this would use xlsx library
    // to generate an Excel file with the random selections
    
    // Mock Excel content as CSV for demonstration
    let content = "No,Route,Dir,SelType,MilePost\n";
    selections.forEach((selection, index) => {
      content += `${index + 1},${selection.route},${selection.dir},${selection.selType},${selection.milepost}\n`;
    });
    
    return Buffer.from(content, 'utf-8');
  }

  private static async storeReportInS3(pdfBuffer: Buffer, title: string): Promise<void> {
    const bucketName = process.env.S3_BUCKET_NAME || 'rmpg-reports-bucket';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `reports/${timestamp}-${title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        Metadata: {
          'generated-date': new Date().toISOString(),
          'report-type': 'random-milepost-inspection'
        }
      });
      
      await this.s3Client.send(command);
      console.log(`Report stored in S3: s3://${bucketName}/${key}`);
    } catch (error) {
      console.error('Failed to store report in S3:', error);
      // Don't fail the generation if S3 storage fails
    }
  }

  static async listStoredReports(): Promise<string[]> {
    const bucketName = process.env.S3_BUCKET_NAME || 'rmpg-reports-bucket';
    
    try {
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'reports/'
      });
      
      const response = await this.s3Client.send(command);
      return response.Contents?.map(obj => obj.Key || '') || [];
    } catch (error) {
      console.error('Failed to list S3 reports:', error);
      return [];
    }
  }
}
