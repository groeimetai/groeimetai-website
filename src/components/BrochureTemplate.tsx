import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register custom fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #FF6600',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottom: '1 solid #FF6600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  text: {
    fontSize: 11,
    color: '#333333',
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 5,
    paddingLeft: 15,
  },
  serviceBox: {
    backgroundColor: '#FFF5F0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeft: '3 solid #FF6600',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #E0E0E0',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
  caseStudy: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  caseStudyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  caseStudyMetric: {
    fontSize: 10,
    color: '#FF6600',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 40,
    fontSize: 10,
    color: '#666666',
  },
});

export const createBrochureDocument = (locale: 'en' | 'nl', translations: any) => {
  const t = translations;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>GroeimetAI</Text>
          <Text style={styles.tagline}>
            {locale === 'nl' ? 'Strategische AI Consultancy' : 'Strategic AI Consultancy'}
          </Text>
        </View>

        <View style={{ marginTop: 50, marginBottom: 50 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333333', marginBottom: 20 }}>
            {t.brochure.coverTitle}
          </Text>
          <Text style={styles.text}>{t.brochure.coverDescription}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>
              {locale === 'nl' ? 'Gebruikers' : 'Users'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>
              {locale === 'nl' ? 'Projecten' : 'Projects'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>€2.8M</Text>
            <Text style={styles.statLabel}>
              {locale === 'nl' ? 'Bespaard' : 'Saved'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.brochure.footer}</Text>
        </View>
      </Page>

      {/* About Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.brochure.aboutTitle}</Text>
          <Text style={styles.text}>{t.brochure.aboutDescription}</Text>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.subtitle}>{t.brochure.whyChooseUs}</Text>
            <Text style={styles.bulletPoint}>• {t.brochure.whyPoint1}</Text>
            <Text style={styles.bulletPoint}>• {t.brochure.whyPoint2}</Text>
            <Text style={styles.bulletPoint}>• {t.brochure.whyPoint3}</Text>
            <Text style={styles.bulletPoint}>• {t.brochure.whyPoint4}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.brochure.approachTitle}</Text>
          <Text style={styles.text}>{t.brochure.approachDescription}</Text>
        </View>

        <Text style={styles.pageNumber}>2</Text>
      </Page>

      {/* Services Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.brochure.servicesTitle}</Text>

          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>{t.brochure.service1Title}</Text>
            <Text style={styles.serviceDescription}>{t.brochure.service1Description}</Text>
          </View>

          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>{t.brochure.service2Title}</Text>
            <Text style={styles.serviceDescription}>{t.brochure.service2Description}</Text>
          </View>

          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>{t.brochure.service3Title}</Text>
            <Text style={styles.serviceDescription}>{t.brochure.service3Description}</Text>
          </View>

          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>{t.brochure.service4Title}</Text>
            <Text style={styles.serviceDescription}>{t.brochure.service4Description}</Text>
          </View>

          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>{t.brochure.service5Title}</Text>
            <Text style={styles.serviceDescription}>{t.brochure.service5Description}</Text>
          </View>

          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>{t.brochure.service6Title}</Text>
            <Text style={styles.serviceDescription}>{t.brochure.service6Description}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>3</Text>
      </Page>

      {/* Case Studies Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.brochure.caseStudiesTitle}</Text>

          <View style={styles.caseStudy}>
            <Text style={styles.caseStudyTitle}>{t.brochure.case1Title}</Text>
            <Text style={styles.text}>{t.brochure.case1Description}</Text>
            <Text style={styles.caseStudyMetric}>{t.brochure.case1Metrics}</Text>
          </View>

          <View style={styles.caseStudy}>
            <Text style={styles.caseStudyTitle}>{t.brochure.case2Title}</Text>
            <Text style={styles.text}>{t.brochure.case2Description}</Text>
            <Text style={styles.caseStudyMetric}>{t.brochure.case2Metrics}</Text>
          </View>

          <View style={styles.caseStudy}>
            <Text style={styles.caseStudyTitle}>{t.brochure.case3Title}</Text>
            <Text style={styles.text}>{t.brochure.case3Description}</Text>
            <Text style={styles.caseStudyMetric}>{t.brochure.case3Metrics}</Text>
          </View>

          <View style={styles.caseStudy}>
            <Text style={styles.caseStudyTitle}>{t.brochure.case4Title}</Text>
            <Text style={styles.text}>{t.brochure.case4Description}</Text>
            <Text style={styles.caseStudyMetric}>{t.brochure.case4Metrics}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>4</Text>
      </Page>

      {/* Contact Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.brochure.contactTitle}</Text>
          <Text style={styles.text}>{t.brochure.contactDescription}</Text>

          <View style={{ marginTop: 30 }}>
            <Text style={styles.subtitle}>{t.brochure.getInTouch}</Text>
            <Text style={styles.contactInfo}>Email: info@groeimetai.io</Text>
            <Text style={styles.contactInfo}>Tel: +31 (0)20 123 4567</Text>
            <Text style={styles.contactInfo}>{t.brochure.location}</Text>
            <Text style={styles.contactInfo}>Website: www.groeimetai.io</Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={styles.subtitle}>{t.brochure.nextStepsTitle}</Text>
            <Text style={styles.bulletPoint}>1. {t.brochure.nextStep1}</Text>
            <Text style={styles.bulletPoint}>2. {t.brochure.nextStep2}</Text>
            <Text style={styles.bulletPoint}>3. {t.brochure.nextStep3}</Text>
            <Text style={styles.bulletPoint}>4. {t.brochure.nextStep4}</Text>
          </View>
        </View>

        <View style={[styles.footer, { position: 'relative', marginTop: 50 }]}>
          <Text style={styles.footerText}>© 2024 GroeimetAI - {t.brochure.allRightsReserved}</Text>
          <Text style={[styles.footerText, { marginTop: 5 }]}>{t.brochure.strategicPartner}</Text>
        </View>

        <Text style={styles.pageNumber}>5</Text>
      </Page>
    </Document>
  );
};

