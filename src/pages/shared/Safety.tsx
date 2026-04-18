export default function Safety() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Safety Tips</h1>
      <p className="text-gray-600 mb-6">Your safety is our priority. Follow these guidelines to have a secure experience on Nimart.</p>

      <div className="space-y-6 text-gray-700">
        <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h2 className="text-lg font-semibold text-yellow-800">For Customers</h2>
        </section>
        <ul className="list-disc list-inside space-y-3">
          <li><strong>Meet in safe, public locations.</strong> For in‑person services, choose well‑lit areas with people around. Avoid isolated spots.</li>
          <li><strong>Verify the Provider.</strong> Check reviews, ratings, and profile completeness. Use the in‑app chat to confirm details before meeting.</li>
          <li><strong>Avoid upfront full payment.</strong> Do not pay the entire amount before the service is satisfactorily completed. Negotiate a deposit or milestone payment.</li>
          <li><strong>Keep communication on the Platform.</strong> Use Nimart's chat system to maintain a record of all conversations. Avoid moving to WhatsApp or SMS too early.</li>
          <li><strong>Trust your instincts.</strong> If something feels off, cancel the booking and report the Provider to us.</li>
        </ul>

        <section className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
          <h2 className="text-lg font-semibold text-blue-800">For Providers</h2>
        </section>
        <ul className="list-disc list-inside space-y-3">
          <li><strong>Verify the Customer.</strong> Check the customer's profile and reviews (if any). Use the chat to clarify service expectations.</li>
          <li><strong>Meet in safe locations.</strong> If meeting at the customer's location, share your live location with a trusted contact.</li>
          <li><strong>Secure payment.</strong> Agree on payment terms before starting work. Consider requesting a small deposit for larger jobs.</li>
          <li><strong>Document your work.</strong> Take before‑and‑after photos to protect yourself in case of disputes.</li>
          <li><strong>Report suspicious activity.</strong> If a customer makes you uncomfortable, block and report them immediately.</li>
        </ul>

        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Report a Safety Concern</h2>
          <p>If you experience or witness any unsafe behavior, harassment, or fraud, please report it immediately:</p>
          <ul className="mt-2 space-y-2">
            <li>📧 Email: <a href="mailto:safety@nimart.ng" className="text-primary-600 hover:underline">safety@nimart.ng</a></li>
            <li>📞 Phone: <a href="tel:+23438887589" className="text-primary-600 hover:underline">+234 388 875 89</a></li>
            <li>🚨 In‑app: Use the "Report" button on the Provider's profile or in the chat.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}