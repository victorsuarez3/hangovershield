export const PrivacyPolicyContent = () => (
  <div className="prose prose-sm md:prose-base max-w-none">
    <h3 className="text-xl font-bold text-text-dark mb-4">Your Privacy Matters</h3>
    <p className="text-text-body leading-relaxed mb-4">
      At Hangover Shield, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app and services.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Information We Collect</h4>
    <p className="text-text-body leading-relaxed mb-4">
      We collect information you provide directly to us, including your email address for notifications, and data about your usage of the app such as recovery plans accessed and settings preferences.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">How We Use Your Information</h4>
    <p className="text-text-body leading-relaxed mb-4">
      Your information is used to provide and improve our services, send you important updates about the app, and personalize your recovery experience. We never sell your personal data to third parties.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Data Security</h4>
    <p className="text-text-body leading-relaxed mb-4">
      We implement appropriate security measures to protect your personal information. All data transmission is encrypted, and we regularly review our security practices.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Your Rights</h4>
    <p className="text-text-body leading-relaxed mb-4">
      You have the right to access, update, or delete your personal information at any time. Contact us at{" "}
      <a href="mailto:privacy@hangovershield.co" className="text-deep-teal font-semibold hover:underline">
        privacy@hangovershield.co
      </a>{" "}
      for any privacy-related requests.
    </p>

    <p className="text-sm text-text-body italic mt-8">
      Last updated: December {new Date().getFullYear()}
    </p>
  </div>
);

export const TermsConditionsContent = () => (
  <div className="prose prose-sm md:prose-base max-w-none">
    <h3 className="text-xl font-bold text-text-dark mb-4">Terms & Conditions</h3>
    <p className="text-text-body leading-relaxed mb-4">
      Welcome to Hangover Shield. By using our app and services, you agree to these Terms & Conditions. Please read them carefully.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Acceptance of Terms</h4>
    <p className="text-text-body leading-relaxed mb-4">
      By accessing or using Hangover Shield, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Use of the App</h4>
    <p className="text-text-body leading-relaxed mb-4">
      Hangover Shield provides wellness guidance and recovery protocols. The app is not a substitute for professional medical advice. Always consult with a healthcare provider for medical concerns.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Subscription & Payment</h4>
    <p className="text-text-body leading-relaxed mb-4">
      Access to Smart Plan features requires a paid subscription. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date. Refunds are handled according to App Store and Google Play policies.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">User Responsibilities</h4>
    <p className="text-text-body leading-relaxed mb-4">
      You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to use the app only for lawful purposes.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Limitation of Liability</h4>
    <p className="text-text-body leading-relaxed mb-4">
      Hangover Shield is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the app.
    </p>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Changes to Terms</h4>
    <p className="text-text-body leading-relaxed mb-4">
      We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the new Terms.
    </p>

    <p className="text-sm text-text-body italic mt-8">
      Last updated: December {new Date().getFullYear()}
    </p>
  </div>
);

export const SupportContent = () => (
  <div className="prose prose-sm md:prose-base max-w-none">
    <h3 className="text-xl font-bold text-text-dark mb-4">We're Here to Help</h3>
    <p className="text-text-body leading-relaxed mb-6">
      Have questions, feedback, or need assistance? We'd love to hear from you. Hangover Shield is built by a small team that genuinely cares about helping you feel better.
    </p>

    <div className="glass-sm rounded-2xl p-6 mb-6">
      <h4 className="text-lg font-semibold text-text-dark mb-3">Contact Us</h4>
      <p className="text-text-body mb-4">
        Email us directly at:
      </p>
      <a
        href="mailto:support@hangovershield.co"
        className="inline-flex items-center gap-2 text-deep-teal font-semibold text-lg hover:underline"
      >
        support@hangovershield.co
      </a>
    </div>

    <h4 className="text-lg font-semibold text-text-dark mt-6 mb-3">Common Questions</h4>

    <div className="space-y-4">
      <div>
        <p className="font-semibold text-text-dark mb-2">How does the Smart Plan work?</p>
        <p className="text-text-body leading-relaxed">
          The Smart Plan analyzes your symptoms, sleep quality, and daily schedule to create a personalized recovery protocol tailored to your specific needs.
        </p>
      </div>

      <div>
        <p className="font-semibold text-text-dark mb-2">Can I cancel my subscription?</p>
        <p className="text-text-body leading-relaxed">
          Yes, you can cancel anytime through your App Store or Google Play account settings. Your access continues until the end of the billing period.
        </p>
      </div>

      <div>
        <p className="font-semibold text-text-dark mb-2">Is my data private?</p>
        <p className="text-text-body leading-relaxed">
          Absolutely. We never sell your data, and all information is encrypted and stored securely. Read our full{" "}
          <span className="text-deep-teal font-semibold">Privacy Policy</span> for details.
        </p>
      </div>
    </div>

    <div className="mt-8 p-6 bg-serenity-mint bg-opacity-30 rounded-2xl">
      <p className="text-text-body leading-relaxed">
        <strong className="text-text-dark">Response time:</strong> We typically respond within 24 hours on business days. Thank you for your patience and for supporting Hangover Shield.
      </p>
    </div>
  </div>
);
