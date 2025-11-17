export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-slate max-w-none space-y-6">
            <p className="text-sm text-slate-600">
              <strong>Last Updated:</strong> November 17, 2024
            </p>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed">
                Welcome to The10KPromise ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.1 Personal Information</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                When you register or use our services, we may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Name (first name and last name)</li>
                <li>Email address</li>
                <li>Google account information (when signing in with Google)</li>
                <li>Partner ID and organizational information</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.2 Usage Information</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We automatically collect certain information about your device and how you interact with our services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>IP address</li>
                <li>Pages visited and features used</li>
                <li>Time and date of visits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>To provide, operate, and maintain our services</li>
                <li>To authenticate and manage user accounts</li>
                <li>To track and display protection metrics and leaderboards</li>
                <li>To communicate with you about your account and our services</li>
                <li>To improve and personalize user experience</li>
                <li>To analyze usage patterns and optimize our platform</li>
                <li>To detect, prevent, and address technical issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.1 With Your Consent</h3>
              <p className="text-slate-700 leading-relaxed">
                We may share your information when you give us explicit permission to do so.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.2 Service Providers</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We may share information with third-party service providers who assist us in operating our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Supabase (database and authentication services)</li>
                <li>Google OAuth (authentication services)</li>
                <li>Vercel (hosting services)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.3 Legal Requirements</h3>
              <p className="text-slate-700 leading-relaxed">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.4 Within Our Organization</h3>
              <p className="text-slate-700 leading-relaxed">
                Partner information and leaderboard data may be visible to other authenticated users and administrators within the platform for the purpose of tracking collective progress toward our 10,000 family protection goal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Data Security</h2>
              <p className="text-slate-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Secure authentication via Google OAuth</li>
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Role-based access control</li>
                <li>Regular security assessments</li>
                <li>Secure database infrastructure through Supabase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your information is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Access:</strong> You can request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> You can update or correct your information through your profile</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and associated data</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data in a structured format</li>
                <li><strong>Withdrawal of Consent:</strong> You can withdraw your consent for data processing at any time</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at the email address provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-slate-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us remember your preferences, understand how you use our services, and improve functionality. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Third-Party Links</h2>
              <p className="text-slate-700 leading-relaxed">
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will promptly delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of our services after such changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Google OAuth and Data Usage</h2>
              <p className="text-slate-700 leading-relaxed">
                When you sign in with Google, we request access to your basic profile information (name and email address). We use this information solely for authentication and account management purposes. We do not access or store your Google password. Your use of Google's authentication services is also subject to Google's Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-4">
                <p className="text-slate-900 font-semibold mb-2">The10KPromise</p>
                <p className="text-slate-700">
                  Email: <a href="mailto:privacy@the10kpromise.com" className="text-blue-600 hover:text-blue-700 underline">privacy@the10kpromise.com</a>
                </p>
                <p className="text-slate-700">
                  Website: <a href="https://the10kpromise.com" className="text-blue-600 hover:text-blue-700 underline">https://the10kpromise.com</a>
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                This Privacy Policy is effective as of November 17, 2024, and applies to all users of The10KPromise platform.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

