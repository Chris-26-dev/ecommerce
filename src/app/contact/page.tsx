import ContactForm from "@/components/ContactForm";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-dark-900">Contact Us</h1>
          <p className="mt-2 text-sm text-dark-700">
            Questions, feedback, or need help with an order? Send us a message and our support team will
            get back within one business day.
          </p>
        </div>

        {/* enhanced back to shop button */}
        <Link
          href="/"
          aria-label="Back to shop"
          className="px-6 group inline-flex items-center gap-3 rounded-md bg-gray-100 py-3 text-sm font-medium text-dark-900 shadow-sm ring-offset-2 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <span
            aria-hidden
            className="inline-block transform transition-transform duration-150 group-hover:-translate-x-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <span>Back</span>

          <span className="sr-only"> — return to the store homepage</span>
        </Link>
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <ContactForm />
        </div>

        <aside className="order-1 rounded-lg border border-light-300 bg-white/70 p-6 md:order-2">
          <h2 className="mb-4 text-lg font-medium text-dark-900">Other ways to reach us</h2>

          <div className="space-y-4 text-sm text-dark-700">
            <div>
              <p className="font-medium text-dark-900">Email</p>
              <p>
                For general inquiries:{" "}
                <a href="mailto:hello@example.com" className="text-primary-600 hover:underline">
                  hello@example.com
                </a>
              </p>
              <p>
                For press & partnerships:{" "}
                <a href="mailto:partners@example.com" className="text-primary-600 hover:underline">
                  partners@example.com
                </a>
              </p>
            </div>

            <div>
              <p className="font-medium text-dark-900">Phone</p>
              <p>
                US: <a href="tel:+18005551234" className="text-primary-600 hover:underline">+1 (800) 555-1234</a>
              </p>
            </div>

            <div>
              <p className="font-medium text-dark-900">Support hours</p>
              <p>Mon–Fri: 9:00 — 18:00 (local)</p>
              <p>Sat–Sun: limited support</p>
            </div>

            <div>
              <p className="font-medium text-dark-900">Address</p>
              <p>123 Commerce Ave, Suite 200<br/>Cityville, ST 12345</p>
            </div>

            <div>
              <p className="font-medium text-dark-900">Quick FAQ</p>
              <ul className="mt-2 list-inside list-disc">
                <li>Orders: check your account → Orders</li>
                <li>Returns: 30-day returns policy</li>
                <li>Shipping: real-time tracking available from your order page</li>
              </ul>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}