import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { to, name, company, report, timestamp } = await req.json();
    
    console.log('Full report email API called for:', { to, name, company, score: report.score });
    
    if (!to || !name || !report) {
      console.error('Missing required fields for full report email');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Generate professional email with improved styling
    const emailHtml = createProfessionalEmailTemplate(name, company, report);
    
    // Generate professional PDF certificate (separate from email)
    const pdfBuffer = await generatePDFCertificate(name, company, report);
    
    // Send email with PDF attachment and embedded logo
    try {
      const emailResponse = await transporter.sendMail({
        from: `"GroeimetAI - Agent Readiness Report" <${process.env.SMTP_USER}>`,
        to: to,
        subject: `🏆 Je volledige Agent Readiness Report: ${report.score}/100 (${getMaturityLevel(report.score)})`,
        html: emailHtml,
        attachments: [
          {
            filename: `Agent-Readiness-Report-${company.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          },
          {
            filename: 'groeimet-ai-logo.png',
            path: '/Users/nielsvanderwerf/groeimetai-agents/groeimetai-website/public/groeimet-ai-logo.svg',
            cid: 'groeimetai-logo' // Content ID for embedding
          }
        ]
      });

      console.log('Full Agent Readiness Report email sent successfully:', emailResponse.messageId);
      
      return NextResponse.json({
        success: true,
        message: 'Full Agent Readiness Report sent successfully',
        messageId: emailResponse.messageId
      });
      
    } catch (emailError: any) {
      console.error('SMTP error sending full report:', emailError);
      
      // Fallback: log the complete HTML report
      console.log(`
=== FULL REPORT EMAIL CONTENT ===
Subject: 🏆 Je volledige Agent Readiness Report: ${report.score}/100
To: ${to}
Error: ${emailError.message}

REPORT CONTENT:
${emailHtml.substring(0, 1000)}...
=== END FULL REPORT ===
      `);
      
      return NextResponse.json({
        success: false,
        message: 'Failed to send full report email',
        error: emailError.message
      });
    }

  } catch (error) {
    console.error('Full report email API error:', error);
    return NextResponse.json(
      { error: 'Failed to process full report email' },
      { status: 500 }
    );
  }
}

function getMaturityLevel(score: number): string {
  if (score >= 90) return 'Agent-Ready (Level 5)';
  if (score >= 70) return 'Integration-Ready (Level 4)';
  if (score >= 50) return 'Digitalization-Ready (Level 3)';
  if (score >= 30) return 'Foundation-Building (Level 2)';
  return 'Pre-Digital (Level 1)';
}

async function generatePDFCertificate(name: string, company: string, report: any): Promise<Buffer> {
  try {
    console.log('Generating simplified PDF certificate...');
    
    // Create simpler, stable certificate HTML
    const certificateHtml = createSimpleCertificate(name, company, report);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      timeout: 15000
    });
    
    const page = await browser.newPage();
    await page.setDefaultTimeout(10000);
    
    // Simple content loading
    await page.setContent(certificateHtml, { 
      waitUntil: 'domcontentloaded',
      timeout: 8000 
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm', 
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });
    
    await browser.close();
    console.log('✅ PDF certificate generated successfully');
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    
    // Return fallback simple HTML as attachment
    console.log('📄 Creating fallback HTML report...');
    const fallbackHtml = createSimpleCertificate(name, company, report);
    return Buffer.from(fallbackHtml, 'utf8');
  }
}

function createSimpleCertificate(name: string, company: string, report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Agent Readiness Certificate - ${company}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif; 
      background: #000000; color: #ffffff; 
      line-height: 1.6;
    }
    
    /* PAGE 1: Certificate & Score */
    .page-1 { 
      width: 100%; height: 100vh; padding: 40px; 
      background: #000000;
      background-image: 
        radial-gradient(circle at 20% 30%, rgba(248, 115, 21, 0.08) 0%, transparent 60%),
        radial-gradient(circle at 80% 70%, rgba(255, 133, 51, 0.06) 0%, transparent 60%);
      page-break-after: always;
    }
    
    .header { text-align: center; margin-bottom: 50px; }
    .logo { 
      width: 200px; height: auto; margin: 0 auto 20px auto;
    }
    
    .certificate-title {
      font-size: 42px; font-weight: 800; 
      background: linear-gradient(135deg, #F87315, #FF8533);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      margin-bottom: 15px;
    }
    
    .score-section { text-align: center; margin: 50px 0; }
    .company-name { font-size: 36px; font-weight: 700; color: #F87315; margin-bottom: 15px; }
    
    .score-circle { 
      width: 140px; height: 140px; border-radius: 50%; 
      background: linear-gradient(135deg, #F87315, #FF8533);
      color: #fff; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-size: 42px; font-weight: 800; margin: 30px auto;
      box-shadow: 0 8px 30px rgba(248, 115, 21, 0.4);
    }
    
    .level-badge {
      background: rgba(255,255,255,0.1); border: 2px solid #F87315;
      padding: 15px 30px; border-radius: 50px; font-size: 20px;
      font-weight: 600; margin: 25px auto; display: inline-block;
    }
    
    .breakdown-grid { 
      display: grid; grid-template-columns: repeat(2, 1fr); 
      gap: 20px; margin: 30px 0; 
    }
    .breakdown-item { 
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      padding: 20px; border-radius: 12px; text-align: center; 
    }
    .breakdown-item h4 { color: #F87315; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .breakdown-item .score { font-size: 28px; font-weight: 700; color: #F87315; }
    
    /* PAGE 2: Content */
    .page-2 { 
      width: 100%; min-height: 100vh; padding: 40px; 
      background: #000000; page-break-before: always; page-break-after: always;
    }
    
    .content-section { 
      margin: 25px 0; padding: 20px; 
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; 
    }
    
    .section-title { 
      color: #F87315; font-size: 22px; font-weight: 700; 
      margin-bottom: 15px; text-align: center;
    }
    
    .content-text {
      font-size: 13px; line-height: 1.6; text-align: justify; white-space: pre-line;
    }
    
    .highlight-number {
      color: #F87315; font-weight: 700; font-size: 14px;
    }
    
    .bullet-list {
      margin: 15px 0; padding-left: 0;
    }
    
    .bullet-item {
      margin: 8px 0; padding-left: 20px; position: relative;
    }
    
    .bullet-item:before {
      content: "•"; color: #F87315; font-weight: bold; 
      position: absolute; left: 0; font-size: 16px;
    }
    
    .quote-highlight {
      background: rgba(248, 115, 21, 0.08); 
      border-left: 3px solid #F87315; 
      padding: 12px 15px; margin: 10px 0;
      border-radius: 0 6px 6px 0; font-style: italic;
    }
    
    /* PAGE 3: Footer */
    .page-3 { 
      width: 100%; height: 100vh; padding: 40px; 
      background: #080D14; text-align: center;
      page-break-before: always;
      display: flex; flex-direction: column; justify-content: center;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: Certificate & Score -->
  <div class="page-1">
    <div class="header">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 62" class="logo">
        <style>
          .logo-text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: white; }
          .text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: #F87315; }
        </style>
        <text x="10" y="52" class="logo-text">Groeimet</text>
        <text x="265" y="52" class="text">Ai</text>
      </svg>
      <h1 class="certificate-title">Agent Readiness Certificate</h1>
      <p style="font-size: 18px; opacity: 0.8;">Official Assessment Report • Agent Infrastructure Specialists</p>
    </div>

    <div class="score-section">
      <div class="company-name">${company}</div>
      <p style="opacity: 0.8; margin-bottom: 30px;">Assessment voor: ${name} • ${new Date().toLocaleDateString('nl-NL')}</p>
      
      <div class="score-circle">
        <div>${report.score}</div>
        <div style="font-size: 16px; font-weight: 400;">/ 100</div>
      </div>
      
      <div class="level-badge">
        ${getMaturityLevel(report.score)}
      </div>
      
      <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">
        ${getTimeDescription(report.score)}
      </p>
    </div>

    <div class="breakdown-grid">
      <div class="breakdown-item">
        <h4>🔗 API Connectivity</h4>
        <div class="score">${calculateAPIScore(report)}/25</div>
        <small style="opacity: 0.7;">Systeem integratie</small>
      </div>
      <div class="breakdown-item">
        <h4>📊 Data Access</h4>
        <div class="score">${calculateDataScore(report)}/25</div>
        <small style="opacity: 0.7;">Data toegankelijkheid</small>
      </div>
      <div class="breakdown-item">
        <h4>📋 Process Docs</h4>
        <div class="score">${calculateProcessScore(report)}/25</div>
        <small style="opacity: 0.7;">Documentatie</small>
      </div>
      <div class="breakdown-item">
        <h4>🚀 Team Readiness</h4>
        <div class="score">${calculateTeamScore(report)}/25</div>
        <small style="opacity: 0.7;">Adoption capability</small>
      </div>
    </div>
  </div>

  <!-- PAGE 2: Executive Summary & Score Breakdown -->
  <div class="page-2">
    <h1 style="color: #F87315; font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 40px;">
      📊 Executive Summary & Score Analysis
    </h1>

    ${report.executiveSummary ? `
    <div class="content-section">
      <h2 class="section-title">🎯 Executive Summary</h2>
      <div style="background: rgba(248, 115, 21, 0.05); border-left: 4px solid #F87315; padding: 20px; margin: 15px 0; border-radius: 0 12px 12px 0;">
        <p class="content-text">
          ${report.executiveSummary}
        </p>
      </div>
    </div>` : ''}

    ${report.scoreBreakdownAnalysis ? `
    <div class="content-section">
      <h2 class="section-title">📊 Gedetailleerde Score Breakdown</h2>
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 12px;">
        <div class="content-text">
          ${report.scoreBreakdownAnalysis}
        </div>
      </div>
    </div>` : ''}
  </div>

  <!-- PAGE 3: Critical Findings & Gap Analysis -->
  <div class="page-2">
    <h1 style="color: #F87315; font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 40px;">
      🔍 Critical Findings & Gap Analysis
    </h1>

    ${report.criticalFindings ? `
    <div class="content-section">
      <h2 class="section-title">🔍 Critical Findings</h2>
      <div style="background: rgba(255, 193, 7, 0.08); border: 1px solid rgba(255, 193, 7, 0.3); padding: 25px; border-radius: 12px;">
        <div style="font-size: 16px; line-height: 1.8; white-space: pre-line;">
          ${report.criticalFindings}
        </div>
      </div>
    </div>` : ''}

    <!-- Readiness Gap Visual -->
    <div class="content-section">
      <h2 class="section-title">📊 Visual Gap Analysis</h2>
      <div style="display: flex; justify-content: center; margin: 25px 0;">
        ${createReadinessChart(report)}
      </div>
      ${report.readinessGaps ? `
      <div style="background: rgba(248, 115, 21, 0.05); padding: 20px; border-radius: 8px; margin-top: 20px;">
        <div style="font-size: 15px; line-height: 1.8; white-space: pre-line;">
          ${report.readinessGaps}
        </div>
      </div>` : ''}
    </div>
  </div>

  <!-- PAGE 4: Automation Roadmap & Opportunities -->
  <div class="page-2">
    <h1 style="color: #F87315; font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 40px;">
      🚀 Automation Roadmap & Opportunities
    </h1>

    ${report.opportunities ? `
    <div class="content-section">
      <h2 class="section-title">💡 Automation Opportunities</h2>
      <div style="background: rgba(40, 167, 69, 0.08); border: 1px solid rgba(40, 167, 69, 0.3); padding: 20px; border-radius: 12px;">
        <div class="content-text">
          ${report.opportunities}
        </div>
      </div>
    </div>` : ''}
  </div>

  <!-- PAGE 5: ROI Potential & Strategic Recommendations -->
  <div class="page-2">
    <h1 style="color: #F87315; font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 40px;">
      💰 ROI Analysis & Strategic Recommendations
    </h1>

    <!-- ROI Potential Chart -->
    <div class="content-section">
      <h2 class="section-title">💰 ROI Potential Analysis</h2>
      <div style="display: flex; justify-content: center; margin: 25px 0;">
        ${createROIChart(report)}
      </div>
      <p style="font-size: 14px; text-align: center; opacity: 0.8; font-style: italic; margin-top: 15px;">
        Geschatte efficiency improvements gebaseerd op jouw readiness level en automation ervaring
      </p>
    </div>

    ${report.nextSteps ? `
    <div class="content-section">
      <h2 class="section-title">📈 Strategic Recommendations</h2>
      <div style="background: linear-gradient(135deg, rgba(248, 115, 21, 0.1), rgba(255, 133, 51, 0.05)); border: 1px solid rgba(248, 115, 21, 0.3); padding: 20px; border-radius: 12px;">
        <div class="content-text" style="font-weight: 500;">
          ${report.nextSteps ? report.nextSteps.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\n\s*\n/g, '\n').trim() : ''}
        </div>
      </div>
    </div>` : ''}
  </div>

  <!-- PAGE 6: Industry Context -->
  <div class="page-2">
    <h1 style="color: #F87315; font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 40px;">
      🏆 Industry Context & Benchmarks
    </h1>

    ${report.industryBenchmark ? `
    <div class="content-section">
      <h2 class="section-title">🏆 Industry Context</h2>
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 12px;">
        <div style="font-size: 16px; line-height: 1.8; white-space: pre-line; text-align: justify;">
          ${report.industryBenchmark}
        </div>
      </div>
    </div>` : ''}
  </div>

  <!-- PAGE 7: Conclusions & Expert Assessment -->
  <div class="page-2">
    <h1 style="color: #F87315; font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 40px;">
      🎯 Conclusies & Expert Assessment Path
    </h1>

    ${report.conclusions ? `
    <div class="content-section">
      <h2 class="section-title">🎯 Conclusies & Volgende Stap</h2>
      <div style="background: linear-gradient(135deg, rgba(248, 115, 21, 0.15), rgba(255, 133, 51, 0.08)); border: 2px solid #F87315; padding: 30px; border-radius: 16px;">
        <div class="content-text" style="font-weight: 500;">
          ${report.conclusions}
        </div>
      </div>
    </div>` : ''}
  </div>

  <!-- PAGE 3: Validation & Contact -->
  <div class="page-3">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 62" style="height: 40px; margin-bottom: 30px;">
      <style>
        .footer-logo-text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: rgba(255,255,255,0.9); }
        .footer-text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: #F87315; }
      </style>
      <text x="10" y="52" class="footer-logo-text">Groeimet</text>
      <text x="265" y="52" class="footer-text">Ai</text>
    </svg>
    
    <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 20px;">Agent Infrastructure Specialists</h2>
    
    <div style="background: rgba(248,115,21,0.1); border: 2px solid #F87315; padding: 30px; border-radius: 16px; margin: 40px auto; max-width: 500px;">
      <h3 style="color: #F87315; font-size: 20px; font-weight: 600; margin-bottom: 15px;">🏆 Certificate Validation</h3>
      <p style="font-size: 14px; opacity: 0.8;">
        Certificate ID: ${Date.now()}_${company.replace(/\s+/g, '')}<br/>
        Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}<br/>
        Geldig tot: ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('nl-NL')}<br/>
        Powered by Claude Opus 4.1
      </p>
    </div>

    <div style="margin-top: 40px;">
      <p style="font-size: 16px; margin: 10px 0;">🌐 www.groeimetai.io</p>
      <p style="font-size: 16px; margin: 10px 0;">✉️ hello@groeimetai.io</p>
      <p style="font-size: 14px; opacity: 0.6; margin-top: 30px;">
        Voor concrete roadmap en implementatie planning: Expert Assessment beschikbaar
      </p>
    </div>
  </div>
</body>
</html>`;
}

function createProfessionalCertificate(name: string, company: string, report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Agent Readiness Certificate - ${company}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body { 
      font-family: 'Inter', sans-serif;
      background: #000000;
      color: #ffffff;
      width: 210mm;
      height: 297mm;
      position: relative;
      overflow: hidden;
    }
    
    .certificate {
      width: 100%;
      height: 100%;
      background: #000000;
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(248, 115, 21, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, rgba(255, 133, 51, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 50% 80%, rgba(248, 115, 21, 0.05) 0%, transparent 60%);
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      text-align: center;
      padding: 40mm 20mm 30mm 20mm;
      border-bottom: 2px solid rgba(248, 115, 21, 0.3);
    }
    
    .logo {
      width: 200px;
      height: auto;
      margin: 0 auto 20px auto;
      filter: brightness(0) invert(1);
    }
    
    .certificate-title {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #F87315, #FF8533);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    
    .subtitle {
      font-size: 18px;
      font-weight: 300;
      opacity: 0.8;
      margin-bottom: 25px;
    }
    
    .score-section {
      text-align: center;
      padding: 20mm 20mm;
      page-break-after: always;
    }
    
    .content-page {
      padding: 30mm 20mm;
      page-break-before: always;
      min-height: calc(100vh - 60mm);
    }
    
    .footer-page {
      page-break-before: always;
      padding: 30mm 20mm;
      text-align: center;
    }
    
    .company-name {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #F87315;
    }
    
    .contact-info {
      font-size: 16px;
      opacity: 0.7;
      margin-bottom: 30px;
    }
    
    .score-circle {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F87315, #FF8533);
      margin: 30px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 800;
      color: white;
      box-shadow: 0 10px 40px rgba(248, 115, 21, 0.4);
    }
    
    .score-text {
      font-size: 14px;
      font-weight: 400;
      margin-top: 5px;
    }
    
    .level-badge {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid #F87315;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 24px;
      font-weight: 600;
      margin: 25px auto;
      display: inline-block;
    }
    
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    
    .breakdown-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    
    .breakdown-item h4 {
      color: #F87315;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .breakdown-item .score {
      font-size: 28px;
      font-weight: 700;
      color: #F87315;
      margin-bottom: 5px;
    }
    
    .breakdown-item .description {
      font-size: 11px;
      opacity: 0.7;
    }
    
    .footer {
      background: #080D14;
      padding: 20mm;
      text-align: center;
      border-top: 2px solid rgba(248, 115, 21, 0.3);
      margin-top: auto;
    }
    
    .certificate-badge {
      background: rgba(248, 115, 21, 0.1);
      border: 2px solid #F87315;
      padding: 15px 25px;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px auto;
      display: inline-block;
    }
    
    .validation-info {
      font-size: 12px;
      opacity: 0.6;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 62" class="logo">
        <style>
          .logo-text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: white; }
          .text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: #F87315; }
        </style>
        <text x="10" y="52" class="logo-text">Groeimet</text>
        <text x="265" y="52" class="text">Ai</text>
      </svg>
      
      <h1 class="certificate-title">Agent Readiness Certificate</h1>
      <p class="subtitle">Official Assessment Report • Agent Infrastructure Specialists</p>
      
      <div class="certificate-badge">
        🏆 Verified Agent Readiness Assessment
      </div>
    </div>
    
    <div class="score-section">
      <div class="company-name">${company}</div>
      <div class="contact-info">Assessment voor: ${name} • ${new Date().toLocaleDateString('nl-NL')}</div>
      
      <div class="score-circle">
        <div>${report.score}</div>
        <div class="score-text">/ 100</div>
      </div>
      
      <div class="level-badge">
        ${getMaturityLevel(report.score)}
      </div>
      
      <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">
        ${getTimeDescription(report.score)}
      </p>
      
      <div class="breakdown-grid">
        <div class="breakdown-item">
          <h4>🔗 API Connectivity</h4>
          <div class="score">${calculateAPIScore(report)}/25</div>
          <div class="description">Systeem integratie</div>
        </div>
        <div class="breakdown-item">
          <h4>📊 Data Access</h4>
          <div class="score">${calculateDataScore(report)}/25</div>
          <div class="description">Data toegankelijkheid</div>
        </div>
        <div class="breakdown-item">
          <h4>📋 Process Docs</h4>
          <div class="score">${calculateProcessScore(report)}/25</div>
          <div class="description">Documentatie kwaliteit</div>
        </div>
        <div class="breakdown-item">
          <h4>🚀 Team Readiness</h4>
          <div class="score">${calculateTeamScore(report)}/25</div>
          <div class="description">Adoption capability</div>
        </div>
      </div>
    </div>

    <!-- PAGE 2: Executive Summary & Analysis -->
    <div class="content-page">
      <h2 style="color: #F87315; font-size: 32px; font-weight: 700; margin-bottom: 25px; text-align: center;">
        📋 Executive Summary
      </h2>
      
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 16px; margin-bottom: 30px;">
        <p style="font-size: 16px; line-height: 1.8;">
          ${report.executiveSummary || 'Your assessment shows potential for significant automation improvements. This analysis is based on your current infrastructure and process maturity.'}
        </p>
      </div>

      <h3 style="color: #F87315; font-size: 24px; font-weight: 600; margin: 25px 0 15px 0;">
        🚀 Automation Opportunities
      </h3>
      
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 16px;">
        <p style="font-size: 15px; line-height: 1.7;">
          ${report.opportunities || 'Based on your systems and current automation level, there are several opportunities for agent implementation that could significantly improve operational efficiency.'}
        </p>
      </div>
    </div>

    <!-- PAGE 3: Next Steps & Validation -->
    <div class="content-page">
      <h2 style="color: #F87315; font-size: 32px; font-weight: 700; margin-bottom: 25px; text-align: center;">
        📈 Recommended Next Steps
      </h2>
      
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 16px; margin-bottom: 30px;">
        <p style="font-size: 16px; line-height: 1.8;">
          ${report.nextSteps || 'Focus on improving your lowest-scoring areas first. Start with API development if needed, then move to process documentation and team training.'}
        </p>
      </div>

      <h3 style="color: #F87315; font-size: 24px; font-weight: 600; margin: 25px 0 15px 0;">
        🏆 Industry Benchmark
      </h3>
      
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 16px; margin-bottom: 40px;">
        <p style="font-size: 15px; line-height: 1.7;">
          ${report.industryBenchmark || 'Dutch organizations typically score 45-60/100 on agent readiness. Your score provides insight into where you stand relative to industry standards.'}
        </p>
      </div>

      ${report.score < 70 ? `
      <div style="background: rgba(248, 115, 21, 0.1); border: 2px solid #F87315; padding: 25px; border-radius: 16px; text-align: center;">
        <h3 style="color: #F87315; font-size: 20px; font-weight: 600; margin-bottom: 15px;">🚀 Ready voor de volgende stap?</h3>
        <p style="font-size: 16px; margin: 0;">
          <strong>Expert Assessment (€2.500)</strong><br/>
          Concrete roadmap, gaps analyse en 90-dagen implementatie plan specifiek voor ${company}.
        </p>
      </div>` : ''}
    </div>
    
    <div class="footer">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 62" style="height: 25px; margin-bottom: 15px;">
        <style>
          .footer-logo-text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: rgba(255,255,255,0.7); }
          .footer-text { font-family: 'Inter', sans-serif; font-size: 62px; font-weight: 900; font-style: italic; letter-spacing: -2.6px; fill: #F87315; }
        </style>
        <text x="10" y="52" class="footer-logo-text">Groeimet</text>
        <text x="265" y="52" class="footer-text">Ai</text>
      </svg>
      
      <p style="margin: 10px 0; color: rgba(255,255,255,0.8);">Agent Infrastructure Specialists</p>
      <p style="margin: 5px 0; font-size: 14px;">www.groeimetai.io • hello@groeimetai.io</p>
      
      <div class="validation-info">
        <p>Certificate ID: ${report.score}_${company.replace(/\s+/g, '')}_${Date.now()}</p>
        <p>Generated: ${new Date().toLocaleDateString('nl-NL')} • Valid until: ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('nl-NL')}</p>
        <p>Powered by Claude • GroeimetAI Agent Readiness Methodology</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Helper functions for PDF score breakdown - use ACTUAL calculated scores
function calculateAPIScore(report: any): number {
  // Get the actual API score from the report generator logic
  if (report.actualScores) {
    return report.actualScores.api;
  }
  return Math.round(report.score * 0.25); // Fallback
}

function calculateDataScore(report: any): number {
  if (report.actualScores) {
    return report.actualScores.data;
  }
  return Math.round(report.score * 0.25); // Fallback
}

function calculateProcessScore(report: any): number {
  if (report.actualScores) {
    return report.actualScores.process;
  }
  return Math.round(report.score * 0.25); // Fallback
}

function calculateTeamScore(report: any): number {
  if (report.actualScores) {
    return report.actualScores.team;
  }
  return Math.round(report.score * 0.25); // Fallback
}

function createProfessionalEmailTemplate(name: string, company: string, report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Je Agent Readiness Report is klaar!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { box-sizing: border-box; }
    body { 
      margin: 0; padding: 0; 
      font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
      background: #000000; line-height: 1.6; color: #ffffff;
      min-height: 100vh;
    }
    .container { max-width: 650px; margin: 0 auto; background: #000000; }
    
    .header { 
      background: #080D14;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(248, 115, 21, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 133, 51, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(248, 115, 21, 0.08) 0%, transparent 50%);
      color: white; padding: 50px 40px; text-align: center; 
      position: relative; overflow: hidden;
    }
    
    .logo { 
      display: flex; align-items: center; justify-content: center; gap: 12px;
      font-size: 28px; font-weight: 700; margin-bottom: 20px; color: #ffffff;
    }
    
    .rocket-emoji { 
      font-size: 32px; 
      background: linear-gradient(135deg, #F87315, #FF8533);
      padding: 8px; border-radius: 12px; 
    }
    
    .score-highlight {
      background: rgba(255,255,255,0.05); 
      border: 1px solid rgba(255,255,255,0.1);
      padding: 30px; border-radius: 16px; margin: 30px 0;
      backdrop-filter: blur(10px);
    }
    
    .content { padding: 40px; background: #000000; }
    
    .score-badge {
      background: linear-gradient(135deg, #F87315, #FF8533);
      color: white; padding: 12px 24px; 
      border-radius: 50px; font-weight: 600; font-size: 16px;
      display: inline-block; margin: 15px 0;
      box-shadow: 0 4px 15px rgba(248, 115, 21, 0.3);
    }
    
    .cta-button {
      background: linear-gradient(135deg, #F87315, #FF8533);
      color: white; padding: 16px 32px; 
      text-decoration: none; border-radius: 12px; font-weight: 600;
      display: inline-block; margin: 25px 0;
      box-shadow: 0 8px 25px rgba(248, 115, 21, 0.4);
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(248, 115, 21, 0.5);
    }
    
    .footer { 
      background: #080D14; color: rgba(255,255,255,0.8); 
      padding: 40px; text-align: center; font-size: 14px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .highlight-box {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: white; padding: 24px; border-radius: 16px; margin: 25px 0;
    }
    
    .feature-list {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 24px; border-radius: 12px; margin: 20px 0;
    }
    
    .feature-list li {
      padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.9);
    }
    
    .feature-list li:last-child { border-bottom: none; }
    
    .upsell-box {
      background: rgba(248, 115, 21, 0.1); 
      border: 1px solid rgba(248, 115, 21, 0.3); 
      padding: 24px; border-radius: 12px; margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="cid:groeimetai-logo" alt="GroeimetAI" style="height: 40px; width: auto; filter: brightness(0) invert(1);" />
      </div>
      <h1 style="margin: 10px 0; font-size: 32px; font-weight: 700;">Agent Readiness Report</h1>
      <p style="opacity: 0.8; margin: 0; font-weight: 300;">Agent Infrastructure Specialists</p>
      
      <div class="score-highlight">
        <h2 style="margin: 0 0 15px 0; font-weight: 600;">Hoi ${name}!</h2>
        <p style="margin: 0; font-size: 18px; opacity: 0.9;">
          Je volledige Agent Readiness Assessment voor ${company} is klaar
        </p>
        
        <div class="score-badge">
          📊 Score: ${report.score}/100 • ${getMaturityLevel(report.score)}
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="highlight-box">
        <h3 style="margin: 0 0 15px 0; color: #F87315; font-weight: 600;">🎯 Jouw Agent Readiness Level</h3>
        <p style="margin: 0; font-size: 18px; font-weight: 500;">
          ${getMaturityLevel(report.score)}
        </p>
        <p style="margin: 10px 0 0 0; opacity: 0.8;">
          ${getTimeDescription(report.score)}
        </p>
      </div>

      <h3 style="color: #F87315; font-weight: 600; margin: 30px 0 15px 0;">📋 Wat zit er in je rapport?</h3>
      <div class="feature-list">
        <ul style="margin: 0; padding: 0; list-style: none;">
          <li>✅ <strong>Gedetailleerde score breakdown</strong> per infrastructuur categorie</li>
          <li>✅ <strong>Executive summary</strong> van je huidige agent readiness</li>
          <li>✅ <strong>Automation opportunities</strong> specifiek voor ${company}</li>
          <li>✅ <strong>Industry benchmark</strong> en trends</li>
          <li>✅ <strong>Aanbevolen vervolgstappen</strong> naar Level 5</li>
          <li>✅ <strong>GroeimetAI certificaat</strong> voor je LinkedIn profiel</li>
        </ul>
      </div>

      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8);">
          📎 <strong style="color: #F87315;">PDF Rapport bijgevoegd</strong><br/>
          Professional branded rapport voor bewaring, sharing en LinkedIn
        </p>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="https://groeimetai.io/dashboard" class="cta-button">
          📱 Bekijk in je Dashboard
        </a>
      </div>

      ${report.score < 70 ? `
      <div class="upsell-box">
        <h4 style="color: #F87315; margin: 0 0 10px 0; font-weight: 600;">🚀 Ready voor de volgende stap?</h4>
        <p style="margin: 0; color: rgba(255,255,255,0.9);">
          <strong>Expert Assessment (€2.500)</strong><br/>
          Concrete roadmap, gaps analyse en 90-dagen implementatie plan specifiek voor ${company}.
        </p>
      </div>` : ''}
    </div>
    
    <div class="footer">
      <div style="margin-bottom: 20px;">
        <div class="logo" style="margin-bottom: 15px;">
          <img src="cid:groeimetai-logo" alt="GroeimetAI" style="height: 30px; width: auto; filter: brightness(0) invert(1); opacity: 0.8;" />
        </div>
        <p style="margin: 5px 0; color: rgba(255,255,255,0.6);">Agent Infrastructure Specialists</p>
      </div>
      <div style="padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="margin: 5px 0;">🌐 www.groeimetai.io • ✉️ hello@groeimetai.io</p>
        <p style="margin: 5px 0; opacity: 0.7; font-size: 12px;">
          Rapport gegenereerd ${new Date().toLocaleDateString('nl-NL')} • Geldig tot ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('nl-NL')}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function createReadinessChart(report: any): string {
  const apiScore = calculateAPIScore(report);
  const dataScore = calculateDataScore(report);  
  const processScore = calculateProcessScore(report);
  const teamScore = calculateTeamScore(report);
  const benchmark = 18; // Industry average per category
  
  return `
    <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="400" height="250" fill="rgba(255,255,255,0.02)" rx="8"/>
      
      <!-- Grid lines -->
      <line x1="60" y1="40" x2="60" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <line x1="60" y1="200" x2="360" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      
      <!-- Y-axis labels -->
      <text x="50" y="45" fill="rgba(255,255,255,0.6)" font-size="12" text-anchor="end">25</text>
      <text x="50" y="85" fill="rgba(255,255,255,0.6)" font-size="12" text-anchor="end">20</text>
      <text x="50" y="125" fill="rgba(255,255,255,0.6)" font-size="12" text-anchor="end">15</text>
      <text x="50" y="165" fill="rgba(255,255,255,0.6)" font-size="12" text-anchor="end">10</text>
      <text x="50" y="205" fill="rgba(255,255,255,0.6)" font-size="12" text-anchor="end">0</text>
      
      <!-- Bars -->
      <!-- API Score -->
      <rect x="80" y="${200 - (apiScore * 6.4)}" width="50" height="${apiScore * 6.4}" fill="#F87315" rx="4"/>
      <rect x="80" y="${200 - (benchmark * 6.4)}" width="50" height="2" fill="rgba(255,255,255,0.4)"/>
      <text x="105" y="220" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="middle">API</text>
      <text x="105" y="235" fill="#F87315" font-size="12" text-anchor="middle" font-weight="bold">${apiScore}</text>
      
      <!-- Data Score -->
      <rect x="150" y="${200 - (dataScore * 6.4)}" width="50" height="${dataScore * 6.4}" fill="#F87315" rx="4"/>
      <rect x="150" y="${200 - (benchmark * 6.4)}" width="50" height="2" fill="rgba(255,255,255,0.4)"/>
      <text x="175" y="220" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="middle">Data</text>
      <text x="175" y="235" fill="#F87315" font-size="12" text-anchor="middle" font-weight="bold">${dataScore}</text>
      
      <!-- Process Score -->
      <rect x="220" y="${200 - (processScore * 6.4)}" width="50" height="${processScore * 6.4}" fill="#F87315" rx="4"/>
      <rect x="220" y="${200 - (benchmark * 6.4)}" width="50" height="2" fill="rgba(255,255,255,0.4)"/>
      <text x="245" y="220" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="middle">Process</text>
      <text x="245" y="235" fill="#F87315" font-size="12" text-anchor="middle" font-weight="bold">${processScore}</text>
      
      <!-- Team Score -->
      <rect x="290" y="${200 - (teamScore * 6.4)}" width="50" height="${teamScore * 6.4}" fill="#F87315" rx="4"/>
      <rect x="290" y="${200 - (benchmark * 6.4)}" width="50" height="2" fill="rgba(255,255,255,0.4)"/>
      <text x="315" y="220" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="middle">Team</text>
      <text x="315" y="235" fill="#F87315" font-size="12" text-anchor="middle" font-weight="bold">${teamScore}</text>
      
      <!-- Legend -->
      <rect x="70" y="15" width="12" height="12" fill="#F87315" rx="2"/>
      <text x="90" y="25" fill="rgba(255,255,255,0.8)" font-size="12">Jouw Score</text>
      <rect x="180" y="19" width="20" height="2" fill="rgba(255,255,255,0.4)"/>
      <text x="210" y="25" fill="rgba(255,255,255,0.8)" font-size="12">Industry Benchmark</text>
    </svg>`;
}

function createPriorityMatrix(report: any): string {
  return `
    <svg width="350" height="200" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="350" height="200" fill="rgba(255,255,255,0.02)" rx="8"/>
      
      <!-- Matrix quadrants -->
      <rect x="20" y="20" width="150" height="80" fill="rgba(220, 53, 69, 0.1)" stroke="rgba(220, 53, 69, 0.3)" rx="4"/>
      <rect x="180" y="20" width="150" height="80" fill="rgba(248, 115, 21, 0.15)" stroke="#F87315" stroke-width="2" rx="4"/>
      <rect x="20" y="110" width="150" height="80" fill="rgba(255, 193, 7, 0.1)" stroke="rgba(255, 193, 7, 0.3)" rx="4"/>
      <rect x="180" y="110" width="150" height="80" fill="rgba(40, 167, 69, 0.1)" stroke="rgba(40, 167, 69, 0.3)" rx="4"/>
      
      <!-- Labels -->
      <text x="95" y="45" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle" font-weight="bold">Hoog Impact</text>
      <text x="95" y="58" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle">Lage Readiness</text>
      <text x="95" y="71" fill="rgba(220, 53, 69, 0.8)" font-size="10" text-anchor="middle">Risico Zone</text>
      
      <text x="255" y="45" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle" font-weight="bold">Hoog Impact</text>
      <text x="255" y="58" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle">Hoge Readiness</text>
      <text x="255" y="71" fill="#F87315" font-size="10" text-anchor="middle" font-weight="bold">START HIER</text>
      
      <text x="95" y="135" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle">Laag Impact</text>
      <text x="95" y="148" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle">Lage Readiness</text>
      <text x="95" y="161" fill="rgba(255, 193, 7, 0.8)" font-size="10" text-anchor="middle">Later</text>
      
      <text x="255" y="135" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle">Laag Impact</text>
      <text x="255" y="148" fill="rgba(255,255,255,0.9)" font-size="11" text-anchor="middle">Hoge Readiness</text>
      <text x="255" y="161" fill="rgba(40, 167, 69, 0.8)" font-size="10" text-anchor="middle">Quick Wins</text>
      
      <!-- Axis labels -->
      <text x="175" y="15" fill="rgba(255,255,255,0.8)" font-size="12" text-anchor="middle" font-weight="600">Agent Readiness Level</text>
      <text x="10" y="105" fill="rgba(255,255,255,0.8)" font-size="12" text-anchor="middle" font-weight="600" transform="rotate(-90 10 105)">Business Impact</text>
    </svg>`;
}

function createROIChart(report: any): string {
  const score = report.score;
  const currentEfficiency = Math.max(30, score - 20);
  const potentialEfficiency = Math.min(95, score + 25);
  const improvement = potentialEfficiency - currentEfficiency;
  
  return `
    <svg width="450" height="200" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="450" height="200" fill="rgba(255,255,255,0.02)" rx="8"/>
      
      <!-- Y-axis labels with more space -->
      <text x="10" y="70" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="start">Huidige</text>
      <text x="10" y="82" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="start">Efficiency</text>
      
      <text x="10" y="120" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="start">Potentiële</text>
      <text x="10" y="132" fill="rgba(255,255,255,0.8)" font-size="11" text-anchor="start">Efficiency</text>
      
      <!-- Current state bar with more space -->
      <rect x="80" y="60" width="${currentEfficiency * 2.8}" height="22" fill="rgba(255,255,255,0.2)" rx="4"/>
      <text x="${85 + currentEfficiency * 2.8}" y="75" fill="rgba(255,255,255,0.9)" font-size="13" font-weight="bold">${currentEfficiency}%</text>
      
      <!-- Potential state bar -->
      <rect x="80" y="110" width="${potentialEfficiency * 2.8}" height="22" fill="#F87315" rx="4"/>
      <text x="${85 + potentialEfficiency * 2.8}" y="125" fill="#F87315" font-size="13" font-weight="bold">${potentialEfficiency}%</text>
      
      <!-- Improvement indicator with better positioning -->
      <path d="M ${85 + currentEfficiency * 2.8} 85 Q ${85 + (currentEfficiency + potentialEfficiency) * 1.4} 95 ${85 + potentialEfficiency * 2.8} 105" 
            stroke="#F87315" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L0,8 L8,4 z" fill="#F87315"/>
        </marker>
      </defs>
      
      <!-- Improvement text with better space -->
      <text x="${85 + (currentEfficiency + potentialEfficiency) * 1.4}" y="92" fill="#F87315" font-size="12" text-anchor="middle" font-weight="bold">
        +${improvement}% verbetering
      </text>
      
      <!-- Scale with better spacing -->
      <text x="80" y="165" fill="rgba(255,255,255,0.6)" font-size="10">0%</text>
      <text x="200" y="165" fill="rgba(255,255,255,0.6)" font-size="10">50%</text>
      <text x="360" y="165" fill="rgba(255,255,255,0.6)" font-size="10">100%</text>
      
      <!-- Title -->
      <text x="225" y="25" fill="rgba(255,255,255,0.9)" font-size="14" text-anchor="middle" font-weight="600">
        Efficiency Potential Analysis
      </text>
    </svg>`;
}

function getTimeDescription(score: number): string {
  if (score >= 90) return 'Je kunt binnen weken agents inzetten! 🚀';
  if (score >= 70) return '2-3 maanden voorbereiding en je bent er klaar voor 🔄';
  if (score >= 50) return '6-12 maanden modernisering werk nodig 🛠️';
  if (score >= 30) return '1-2 jaar infrastructure ontwikkeling vereist 🏗️';
  return 'Begin met digitalisering - agents zijn nog ver weg 📚';
}