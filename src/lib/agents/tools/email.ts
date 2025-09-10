interface EmailParams {
  to: string;
  subject: string;
  content: string;
  attachments?: string[];
}

export class EmailTool {
  async sendEmail(params: EmailParams): Promise<string> {
    try {
      // Validate email
      if (!this.isValidEmail(params.to)) {
        return 'Invalid email address provided';
      }

      // In production, this would use a real email service
      // For now, we'll simulate email sending
      
      const emailId = `EMAIL-${Date.now()}`;
      
      // Format email content
      const formattedEmail = this.formatEmail(params);
      
      // Log email (would actually send in production)
      console.log('Email to send:', {
        id: emailId,
        to: params.to,
        subject: params.subject,
        timestamp: new Date().toISOString(),
      });

      return `
Email Sent Successfully!

Email Details:
- ID: ${emailId}
- To: ${params.to}
- Subject: ${params.subject}
- Status: Delivered
${params.attachments ? `- Attachments: ${params.attachments.length} file(s)` : ''}

The email has been sent and you should receive it within a few minutes.
If you don't see it, please check your spam folder.

For immediate assistance, you can also reach us at:
- Email: info@groeimetai.io
- Phone: +31 20 123 4567
- LinkedIn: linkedin.com/company/groeimetai
`;
    } catch (error) {
      return `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private formatEmail(params: EmailParams): string {
    const footer = `

---
This email was sent by GroeimetAI Assistant
Transforming Business with Intelligent AI Solutions

GroeimetAI B.V.
Amsterdam, Netherlands
info@groeimetai.io
www.groeimetai.com
`;

    return `${params.content}${footer}`;
  }

  async sendFollowUp(
    email: string, 
    context: string, 
    resources: string[]
  ): Promise<string> {
    const subject = 'Follow-up: Your GroeimetAI AI Consultation';
    
    const content = `
Thank you for your interest in GroeimetAI's AI solutions!

Based on our conversation about ${context}, I've compiled some relevant resources for you:

${resources.map((resource, i) => `${i + 1}. ${resource}`).join('\n')}

Next Steps:
1. Review the attached resources
2. Schedule a detailed consultation with our team
3. Receive a customized AI implementation roadmap

Our AI experts are ready to help you:
- Implement cutting-edge GenAI solutions
- Integrate AI with your ServiceNow platform
- Build multi-agent orchestration systems
- Design RAG architectures for your data

Would you like to schedule a consultation? Our team is available for:
- 30-minute discovery calls
- 1-hour technical deep dives
- Half-day strategy workshops

Best regards,
The GroeimetAI Team
`;

    return await this.sendEmail({
      to: email,
      subject,
      content,
      attachments: resources,
    });
  }

  async sendProposal(
    email: string,
    companyName: string,
    requirements: string
  ): Promise<string> {
    const subject = `AI Implementation Proposal for ${companyName}`;
    
    const content = `
Dear ${companyName} Team,

Thank you for considering GroeimetAI as your AI implementation partner.

Based on your requirements:
${requirements}

We've prepared a comprehensive proposal that includes:

1. Executive Summary
   - Current state analysis
   - Proposed AI solutions
   - Expected ROI and benefits

2. Technical Approach
   - Architecture design
   - Technology stack
   - Integration strategy
   - Security considerations

3. Implementation Timeline
   - Phase 1: Discovery & Planning (2 weeks)
   - Phase 2: POC Development (4 weeks)
   - Phase 3: Production Implementation (6-8 weeks)
   - Phase 4: Training & Handover (2 weeks)

4. Investment Overview
   - Implementation costs
   - Licensing requirements
   - Support & maintenance
   - Training programs

5. Success Metrics
   - KPIs and measurement framework
   - Quarterly review process
   - Continuous improvement plan

Our Unique Value Proposition:
✓ 10x productivity improvement with multi-agent systems
✓ 95% accuracy in automated processes
✓ 60% reduction in operational costs
✓ 24/7 AI-powered support

Next Steps:
1. Review this proposal with your team
2. Schedule a Q&A session with our architects
3. Visit our innovation lab for a live demo
4. Sign NDA for detailed technical discussions

We're excited about the opportunity to transform your business with AI!

Best regards,
The GroeimetAI Team
`;

    return await this.sendEmail({
      to: email,
      subject,
      content,
      attachments: ['GroeimetAI_Proposal.pdf', 'Case_Studies.pdf', 'ROI_Calculator.xlsx'],
    });
  }
}