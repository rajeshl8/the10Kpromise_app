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
              <strong>Last Updated:</strong> November 17, 2025
            </p>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed">
                Welcome to The10KPromise. This privacy policy explains how we collect, use, and protect your information when you use our platform to track family protection commitments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">When You Sign Up</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                When you create an account using Google Sign-In, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Email address</strong> - from your Google account</li>
                <li><strong>First name</strong> - provided by you</li>
                <li><strong>Last name</strong> - provided by you</li>
                <li><strong>Display name</strong> - from your Google account</li>
                <li><strong>Partner ID</strong> - your organization's partner identifier (optional)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">When You Use the Platform</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                When you track family protections, we store:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Protection records</strong> - count of families you've helped protect</li>
                <li><strong>Optional notes</strong> - any notes you add about protections</li>
                <li><strong>Dates</strong> - when protections were recorded</li>
                <li><strong>Product types</strong> - type of protection provided (if specified)</li>
                <li><strong>Client location</strong> - state where client is located (if specified)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Automatically Collected</h3>
              <p className="text-slate-700 leading-relaxed">
                We automatically collect basic technical information like your browser type and IP address for security and to make the platform work properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Create and manage your account</li>
                <li>Track your progress toward protection goals</li>
                <li>Display your name on the leaderboard (first and last name only)</li>
                <li>Allow you to view your protection history</li>
                <li>Calculate collective progress toward our 10,000 family goal</li>
                <li>Contact you about your account (using your email)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Information Sharing</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">What's Visible to Other Users</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                When you're signed in, other authenticated users can see:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Your first and last name on the leaderboard</li>
                <li>Your protection count (number of families you've helped)</li>
                <li>Your progress percentage toward your personal goal</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">What We Don't Share</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We do NOT share or sell:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Your email address</li>
                <li>Your Google account information</li>
                <li>Detailed notes about families</li>
                <li>Your personal information with any third parties for marketing</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Service Providers</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We use these trusted services to operate the platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Google OAuth</strong> - for secure sign-in</li>
                <li><strong>Supabase</strong> - for secure data storage</li>
                <li><strong>Vercel</strong> - for hosting the website</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                These services only have access to information necessary to provide their specific functions and are bound by their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Google Sign-In</h2>
              <p className="text-slate-700 leading-relaxed">
                When you sign in with Google, we only request access to your basic profile information (name and email). We do not access your Google password, emails, or any other Google services. Your use of Google Sign-In is also governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google's Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Data Security</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We protect your information using:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Secure authentication through Google OAuth</li>
                <li>Encrypted connections (HTTPS)</li>
                <li>Secure database hosted by Supabase</li>
                <li>Role-based access controls (you can only see your own data)</li>
                <li>Admin-only access to sensitive operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Access your data</strong> - View your profile and protection records anytime</li>
                <li><strong>Update your information</strong> - Edit your first name, last name, and partner ID</li>
                <li><strong>Delete your account</strong> - Contact us to request account deletion</li>
                <li><strong>Export your data</strong> - Request a copy of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                If you have questions about this privacy policy or your data:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-4">
                <p className="text-slate-700">
                  Email: <a href="mailto:the10kpromise@gmail.com" className="text-blue-600 hover:text-blue-700 underline">the10kpromise@gmail.com</a>
                </p>
                <p className="text-slate-700 mt-2">
                  Website: <a href="https://the10kpromise.com" className="text-blue-600 hover:text-blue-700 underline">https://the10kpromise.com</a>
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                This privacy policy is effective as of November 17, 2025.
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
