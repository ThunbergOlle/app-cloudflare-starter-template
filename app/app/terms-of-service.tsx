import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: August 30, 2025</Text>

          <Text style={styles.sectionTitle}>Agreement to Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the Example mobile application
            (&ldquo;Service&rdquo;), you agree to be bound by these Terms of
            Service (&ldquo;Terms&rdquo;). If you disagree with any part of
            these terms, you may not use our Service.
          </Text>

          <Text style={styles.sectionTitle}>Description of Service</Text>
          <Text style={styles.paragraph}>
            Example is a mobile application that uses artificial intelligence to
            identify monuments, landmarks, and points of interest through
            camera-based image recognition. Our Service provides information
            about historical sites, cultural landmarks, and tourist attractions
            based on user-captured photos and location data.
          </Text>

          <Text style={styles.sectionTitle}>
            AI-Generated Content Disclaimer
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>IMPORTANT:</Text> Information provided by
            our AI system about monuments and landmarks is generated using
            machine learning technology and may not always be accurate,
            complete, or up-to-date. Users should:{'\\n'}• Verify information
            through official sources{'\\n'}• Not rely solely on our AI for
            critical decisions{'\\n'}• Understand that historical facts may be
            interpreted differently{'\\n'}• Recognize that AI responses are
            based on training data that may contain inaccuracies{'\\n\\n'}
            We make no warranties regarding the accuracy of monument information
            and disclaim liability for any decisions made based on AI-generated
            content.
          </Text>

          <Text style={styles.sectionTitle}>User Accounts and Eligibility</Text>
          <Text style={styles.paragraph}>
            • You must be at least 13 years old to use this Service{'\\n'}• You
            are responsible for maintaining account security{'\\n'}• You must
            provide accurate information during registration{'\\n'}• One account
            per person - sharing accounts is prohibited{'\\n'}• You are
            responsible for all activities under your account
          </Text>

          <Text style={styles.sectionTitle}>Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree NOT to use our Service to:{'\\n'}• Violate any laws or
            regulations{'\\n'}• Upload inappropriate, offensive, or copyrighted
            images{'\\n'}• Attempt to reverse engineer our AI systems{'\\n'}•
            Interfere with or disrupt the Service{'\\n'}• Collect user data
            without permission{'\\n'}• Use the Service for commercial purposes
            without authorization{'\\n'}• Share false or misleading information
            about monuments
          </Text>

          <Text style={styles.sectionTitle}>
            Camera and Location Permissions
          </Text>
          <Text style={styles.paragraph}>
            By using our Service, you grant us permission to:{'\\n'}• Access
            your camera to capture monument photos{'\\n'}• Use your location
            data to identify nearby points of interest{'\\n'}• Process and
            analyze your photos using our AI systems{'\\n'}• Upload images to
            our servers for identification purposes{'\\n\\n'}
            You may revoke these permissions through your device settings, but
            this may limit app functionality.
          </Text>

          <Text style={styles.sectionTitle}>
            Subscription and Payment Terms
          </Text>
          <Text style={styles.paragraph}>
            • The basic Service is currently free{'\\n'}• Premium subscription
            features may be introduced in the future{'\\n'}• Subscription fees
            are charged through your app store account{'\\n'}• Subscriptions
            auto-renew unless cancelled{'\\n'}• Refunds are subject to app store
            policies{'\\n'}• We reserve the right to change subscription pricing
            with notice
          </Text>

          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            • The Example app and its technology remain our property{'\\n'}• You
            retain rights to photos you capture{'\\n'}• You grant us license to
            process your photos for Service functionality{'\\n'}• Monument
            information in our database may be derived from public sources
            {'\\n'}• You may not copy, modify, or redistribute our app or
            content
          </Text>

          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>
              TO THE MAXIMUM EXTENT PERMITTED BY SWEDISH LAW:
            </Text>
            {'\\n\\n'}• WE ARE NOT LIABLE for inaccurate monument information
            {'\\n'}• WE ARE NOT LIABLE for decisions made based on our AI
            content{'\\n'}• WE ARE NOT LIABLE for any indirect, incidental, or
            consequential damages{'\\n'}• OUR TOTAL LIABILITY is limited to the
            amount paid for the Service (if any){'\\n'}• WE ARE NOT RESPONSIBLE
            for third-party content or services{'\\n\\n'}
            The Service is provided &ldquo;AS IS&rdquo; without warranties of
            any kind.
          </Text>

          <Text style={styles.sectionTitle}>Data Processing and Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of this Service is also governed by our Privacy Policy. We
            process your data in accordance with Swedish data protection laws
            and GDPR. Key points:{'\\n'}• Photos are processed for AI
            identification then deleted from your device{'\\n'}• Location data
            is used to enhance monument identification{'\\n'}• We share image
            data with OpenAI for AI processing{'\\n'}• You have rights to
            access, correct, and delete your data
          </Text>

          <Text style={styles.sectionTitle}>Service Availability</Text>
          <Text style={styles.paragraph}>
            • We strive to keep the Service available but cannot guarantee 100%
            uptime{'\\n'}• We may suspend Service for maintenance or updates
            {'\\n'}• Some features may not work in all geographic locations
            {'\\n'}• We are not liable for Service interruptions or downtime
          </Text>

          <Text style={styles.sectionTitle}>Account Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate your account if you:{'\\n'}• Violate these Terms of
            Service{'\\n'}• Engage in fraudulent or illegal activity{'\\n'}•
            Abuse our AI systems or attempt unauthorized access{'\\n'}• Remain
            inactive for extended periods{'\\n\\n'}
            You may delete your account at any time through the app settings.
            Upon termination, your data will be deleted according to our Privacy
            Policy.
          </Text>

          <Text style={styles.sectionTitle}>Updates to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will
            notify users of material changes by:{'\\n'}• Posting updated Terms
            in the app{'\\n'}• Sending email notifications to registered users
            {'\\n'}• Displaying prominent notices within the app{'\\n\\n'}
            Continued use of the Service after changes constitutes acceptance of
            new Terms.
          </Text>

          <Text style={styles.sectionTitle}>Governing Law and Disputes</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by Swedish law. Any disputes shall be
            resolved through:{'\\n'}• Good faith negotiation first{'\\n'}•
            Mediation if negotiation fails{'\\n'}• Swedish courts as final
            resort{'\\n\\n'}
            EU users may also use the European Commission&rsquo;s Online Dispute
            Resolution platform.
          </Text>

          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms of Service or to report violations,
            contact us:{'\\n\\n'}
            Email: privacy@aperto-app.com{'\\n'}
            Response time: Within 7 business days{'\\n\\n'}
            For immediate safety concerns or content violations, please use the
            in-app reporting features.
          </Text>

          <Text style={styles.sectionTitle}>Severability</Text>
          <Text style={styles.paragraph}>
            If any provision of these Terms is found unenforceable by Swedish
            courts, the remaining provisions shall continue in full force and
            effect. Invalid provisions shall be replaced with enforceable terms
            that achieve the same purpose.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Example, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
