'use client';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/routing';
import {
  FileText,
  Briefcase,
  UserCheck,
  CreditCard,
  Shield,
  Lock,
  AlertTriangle,
  Brain,
  Globe,
  Gavel,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: FileText,
    content: `By accessing and using the services provided by GroeimetAI ("GroeimetAI", "we", "us", or "our"), you ("Client", "you", or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.

These Terms constitute a legally binding agreement between you and GroeimetAI, registered in the Netherlands under Chamber of Commerce number 90102304, with its registered office in Apeldoorn.

By using our services, you represent that you have the legal capacity to enter into this agreement and that you are at least 18 years of age or have obtained parental consent.`,
  },
  {
    id: 'services',
    title: 'Description of Services',
    icon: Briefcase,
    content: `GroeimetAI provides professional AI consultancy services including but not limited to:

    • AI Strategy Development and Implementation
    • Generative AI (GenAI) Solutions and Integration
    • Large Language Model (LLM) Implementation and Fine-tuning
    • Retrieval-Augmented Generation (RAG) Architecture Design
    • Multi-Agent AI Systems and Orchestration
    • ServiceNow AI Integration and Automation
    • Custom AI Solution Development
    • AI Training and Workshops
    • AI Governance and Ethics Consulting
    • Proof of Concept (PoC) Development

All services are provided on a professional consultancy basis and may be subject to separate service agreements, statements of work, or project specifications.`,
  },
  {
    id: 'ai-content',
    title: 'AI-Generated Content and Model Usage',
    icon: Brain,
    content: `AI Output and Accuracy:
    • We utilize various AI models and technologies in our services. While we strive for accuracy, AI-generated content may contain errors, biases, or inaccuracies.
    • You acknowledge that AI outputs should be reviewed and validated before use in critical applications.
    • GroeimetAI is not liable for decisions made solely based on AI-generated recommendations without human oversight.

Model Training and Data Usage:
    • Unless otherwise agreed, your data will not be used to train or improve general AI models.
    • Any model fine-tuning or training using your data will be done exclusively for your benefit and with your explicit consent.
    • We maintain strict data isolation between clients to prevent cross-contamination of AI models.

Intellectual Property of AI Outputs:
    • AI-generated content created specifically for you during our engagement belongs to you, subject to payment of all fees.
    • Generic AI models, methodologies, and frameworks developed by GroeimetAI remain our intellectual property.
    • You grant us a license to use anonymized insights from our engagement to improve our services, unless otherwise agreed.`,
  },
  {
    id: 'accounts',
    title: 'User Accounts and Responsibilities',
    icon: UserCheck,
    content: `Account Creation and Management:
    • You may need to create an account to access certain services or platforms we provide.
    • You are responsible for maintaining the confidentiality of your account credentials.
    • You must provide accurate, current, and complete information during registration.
    • You are responsible for all activities that occur under your account.

Client Responsibilities:
    • Provide timely access to necessary systems, data, and personnel for service delivery.
    • Ensure all provided data complies with applicable laws and regulations.
    • Obtain necessary consents for data processing and AI application deployment.
    • Maintain appropriate backups of your data and systems.
    • Comply with any specific requirements outlined in service agreements.

Prohibited Uses:
    • Using our services for illegal, harmful, or unethical purposes.
    • Attempting to reverse engineer, decompile, or extract source code from our proprietary systems.
    • Using our services to develop competing AI consultancy services.
    • Sharing access credentials or allowing unauthorized access to our platforms.`,
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property Rights',
    icon: Shield,
    content: `GroeimetAI Property:
    • All proprietary methodologies, frameworks, tools, and pre-existing intellectual property remain the exclusive property of GroeimetAI.
    • This includes but is not limited to our AI orchestration frameworks, assessment tools, and implementation methodologies.
    • We grant you a limited, non-exclusive license to use our deliverables for your internal business purposes.

Client Property:
    • You retain all rights to your pre-existing data, content, and intellectual property.
    • Any custom developments created specifically for you become your property upon full payment.
    • You grant us a limited license to use your data and content solely for providing our services.

Third-Party Components:
    • Our services may incorporate third-party AI models, libraries, or tools.
    • Such components are subject to their respective licenses and terms.
    • We will inform you of any significant third-party dependencies and their licensing requirements.`,
  },
  {
    id: 'payment',
    title: 'Payment Terms and Refunds',
    icon: CreditCard,
    content: `Fees and Payment:
    • Service fees are specified in separate service agreements or quotations.
    • All fees are exclusive of VAT and other applicable taxes unless stated otherwise.
    • Payment terms are NET 30 days from invoice date unless otherwise agreed.
    • Late payments incur interest at the statutory commercial rate applicable in the Netherlands.

Billing Models:
    • Fixed Price: For defined scope projects with clear deliverables.
    • Time & Materials: Billed based on actual hours worked at agreed hourly rates.
    • Retainer: Monthly fee for ongoing support and consultation.
    • Success-Based: Fees tied to achieving specific, measurable outcomes (where applicable).

Refunds and Cancellations:
    • Due to the consultancy nature of our services, refunds are generally not provided for completed work.
    • Cancellation terms are specified in individual service agreements.
    • For subscription services, cancellation takes effect at the end of the current billing period.
    • Disputes regarding fees must be raised within 30 days of invoice date.`,
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    icon: AlertTriangle,
    content: `Limitation of Liability:
    • To the maximum extent permitted by law, GroeimetAI's total liability for any claims arising from these Terms or our services shall not exceed the fees paid by you in the twelve (12) months preceding the claim.
    • We are not liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption.

Exclusions:
    • Liability arising from your misuse of AI technologies or failure to implement recommended safeguards.
    • Damages resulting from third-party AI models or services beyond our control.
    • Loss or damage caused by circumstances beyond our reasonable control (force majeure).
    • Consequences of decisions made based on AI outputs without appropriate human oversight.

Indemnification:
    • You agree to indemnify and hold GroeimetAI harmless from any claims arising from:
      - Your use of our services in violation of these Terms
      - Your violation of any laws or third-party rights
      - Content or data you provide to us
      - Your deployment or use of AI solutions we help develop`,
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality',
    icon: Lock,
    content: `Confidential Information:
    • Both parties acknowledge that they may have access to confidential information during the engagement.
    • "Confidential Information" includes any non-public information marked as confidential or that would reasonably be considered confidential.
    • This includes business strategies, technical data, AI models, algorithms, customer data, and pricing information.

Obligations:
    • Both parties agree to maintain the confidentiality of all Confidential Information.
    • Confidential Information will only be used for purposes related to the services.
    • Disclosure is limited to employees and contractors who need to know and are bound by confidentiality obligations.

Exceptions:
    • Information that becomes publicly available through no breach of these Terms.
    • Information independently developed without use of Confidential Information.
    • Information required to be disclosed by law or court order (with prompt notice to the other party).

Duration:
    • Confidentiality obligations survive termination of these Terms for a period of five (5) years.`,
  },
  {
    id: 'data-protection',
    title: 'Data Protection',
    icon: Shield,
    content: `Data Processing:
    • We process personal data in accordance with the General Data Protection Regulation (GDPR) and Dutch data protection laws.
    • Our detailed privacy practices are outlined in our Privacy Policy, which forms part of these Terms.
    • We act as a data processor for personal data you provide for AI processing purposes.

Security Measures:
    • We implement appropriate technical and organizational measures to protect data.
    • This includes encryption, access controls, and regular security assessments.
    • We maintain ISO 27001 compliant information security practices.

Data Processing Agreement:
    • For services involving personal data processing, we will enter into a separate Data Processing Agreement (DPA).
    • You warrant that you have all necessary consents and legal bases for data processing.
    • We will assist you in meeting your GDPR obligations related to our services.`,
  },
  {
    id: 'termination',
    title: 'Termination',
    icon: FileText,
    content: `Termination Rights:
    • Either party may terminate these Terms by providing 30 days written notice.
    • Either party may terminate immediately for material breach that remains uncured after 14 days notice.
    • We may suspend services immediately if you breach payment terms or engage in prohibited uses.

Effects of Termination:
    • Upon termination, all licenses granted under these Terms cease immediately.
    • You must pay all outstanding fees for services provided up to the termination date.
    • We will return or delete your Confidential Information upon written request.
    • Provisions that by their nature should survive termination will remain in effect.

Transition Assistance:
    • Upon request and for additional fees, we provide transition assistance for up to 90 days post-termination.
    • This includes knowledge transfer, documentation, and technical handover support.`,
  },
  {
    id: 'governing-law',
    title: 'Governing Law and Disputes',
    icon: Gavel,
    content: `Applicable Law:
    • These Terms are governed by the laws of the Netherlands.
    • The United Nations Convention on Contracts for the International Sale of Goods does not apply.

Dispute Resolution:
    • Any disputes arising from these Terms shall first be addressed through good faith negotiations.
    • If negotiations fail, disputes shall be submitted to mediation under the rules of the Netherlands Mediation Institute.
    • If mediation fails, disputes shall be resolved by the competent courts of Amsterdam, the Netherlands.

Language:
    • These Terms are drafted in English. In case of translation, the English version prevails.
    • All communication regarding these Terms shall be in English or Dutch, as mutually agreed.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Subtle section divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
            >
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-[-0.02em]">
              Terms of{' '}
              <span
                className="text-white px-3 py-1 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                Service
              </span>
            </h1>
            <p className="text-xl text-white/65 mb-4">
              Professional AI Consultancy Services Agreement
            </p>
            <p className="text-sm text-white/50">
              Last updated: July 2, 2025 | Effective date: July 2, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Table of Contents */}
            <Card className="p-6 mb-12 print:break-inside-avoid bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] transition-all duration-300 group"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <section.icon className="w-5 h-5 text-[#FF9F43]" />
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      {index + 1}. {section.title}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Terms Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="print:break-inside-avoid scroll-mt-20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white tracking-[-0.02em]">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-line text-white/60">{section.content}</p>
                  </div>
                  {index < sections.length - 1 && <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-8" />}
                </div>
              ))}
            </div>

            {/* Additional Sections */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

            <div className="space-y-12">
              {/* Modifications */}
              <div className="print:break-inside-avoid">
                <h2 className="text-2xl font-semibold mb-4 text-white tracking-[-0.02em]">Modifications to Terms</h2>
                <p className="text-white/60 mb-4">
                  We reserve the right to modify these Terms at any time. Material changes will be
                  notified via:
                </p>
                <ul className="list-none space-y-2">
                  <li className="flex items-start text-white/60"><span className="text-[#FF9F43] mr-2">•</span>Email notification to your registered email address</li>
                  <li className="flex items-start text-white/60"><span className="text-[#FF9F43] mr-2">•</span>Prominent notice on our website</li>
                  <li className="flex items-start text-white/60"><span className="text-[#FF9F43] mr-2">•</span>In-platform notifications for active clients</li>
                </ul>
                <p className="text-white/60 mt-4">
                  Continued use of our services after notification constitutes acceptance of the
                  modified Terms.
                </p>
              </div>

              {/* Severability */}
              <div className="print:break-inside-avoid">
                <h2 className="text-2xl font-semibold mb-4 text-white tracking-[-0.02em]">Severability</h2>
                <p className="text-white/60">
                  If any provision of these Terms is found to be unenforceable or invalid by a court
                  of competent jurisdiction, that provision shall be limited or eliminated to the
                  minimum extent necessary so that these Terms shall otherwise remain in full force
                  and effect and enforceable.
                </p>
              </div>

              {/* Entire Agreement */}
              <div className="print:break-inside-avoid">
                <h2 className="text-2xl font-semibold mb-4 text-white tracking-[-0.02em]">Entire Agreement</h2>
                <p className="text-white/60">
                  These Terms, together with any applicable service agreements, statements of work,
                  and our Privacy Policy, constitute the entire agreement between you and GroeimetAI
                  regarding the use of our services. These Terms supersede any prior agreements or
                  understandings, whether written or oral.
                </p>
              </div>

              {/* Assignment */}
              <div className="print:break-inside-avoid">
                <h2 className="text-2xl font-semibold mb-4 text-white tracking-[-0.02em]">Assignment</h2>
                <p className="text-white/60">
                  You may not assign or transfer these Terms or any rights granted hereunder without
                  our prior written consent. We may assign our rights and obligations under these
                  Terms without restriction. Any attempted assignment in violation of this provision
                  is void.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <Card className="p-8 mt-12 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl print:break-inside-avoid">
              <h2 className="text-2xl font-semibold mb-4 text-white tracking-[-0.02em]">Contact Information</h2>
              <p className="text-white/60 mb-6">
                For questions about these Terms of Service or our services, please contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-[#FF9F43]" />
                  <div>
                    <p className="font-semibold text-white">GroeimetAI</p>
                    <p className="text-sm text-white/50">Registered in the Netherlands</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#FF9F43]" />
                  <a href="mailto:legal@groeimetai.io" className="text-[#FF9F43] hover:underline">
                    legal@groeimetai.io
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#FF9F43]" />
                  <a href="tel:+31201234567" className="text-[#FF9F43] hover:underline">
                    +31 (6)81 739 018
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-[#FF9F43] mt-0.5" />
                  <div>
                    <p className="text-white">Headquarters</p>
                    <p className="text-sm text-white/50">Apeldoorn, Netherlands</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

              <div>
                <h3 className="font-semibold mb-2 text-white">Legal Notice</h3>
                <p className="text-sm text-white/50">
                  By using our services, you acknowledge that you have read, understood, and agree
                  to be bound by these Terms of Service. If you are entering into these Terms on
                  behalf of a company or other legal entity, you represent that you have the
                  authority to bind such entity to these Terms.
                </p>
              </div>
            </Card>

            {/* Print Notice */}
            <div className="mt-8 text-center text-sm text-white/50 print:block hidden">
              <p>This document was printed from groeimetai.io/terms</p>
              <p>For the most current version, please visit our website.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .gradient-text {
            -webkit-text-fill-color: black !important;
            background: none !important;
          }

          nav,
          footer {
            display: none !important;
          }

          .print\\:break-inside-avoid {
            break-inside: avoid;
          }

          a {
            color: inherit !important;
            text-decoration: underline !important;
          }

          .bg-gradient-to-br {
            background: none !important;
          }

          .dark\\:prose-invert {
            color: black !important;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: black !important;
          }

          .text-muted-foreground {
            color: #555 !important;
          }
        }
      `}</style>
    </main>
  );
}
