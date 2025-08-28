"use client";

import React, { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribe: boolean;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
    subscribe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate() {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    // simple email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.message.trim().length < 10) return "Message must be at least 10 characters.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data?.error as string) || "Failed to send message. Please try again.");
      }

      setSuccess("Thanks! Your message was sent. We'll reply to your email soon.");
      setForm({ name: "", email: "", subject: "", message: "", subscribe: false });
      setTouched({});
    } catch (err: any) {
      setError(err?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-light-300 bg-white/70 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-dark-900">Full name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          className="w-full rounded-md border border-light-300 px-3 py-2 text-sm"
          placeholder="Jane Doe"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-dark-900">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          className="w-full rounded-md border border-light-300 px-3 py-2 text-sm"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-dark-900">Subject</label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          className="w-full rounded-md border border-light-300 px-3 py-2 text-sm"
          placeholder="Order question, returns, feedback..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-dark-900">Message</label>
        <textarea
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          className="h-32 w-full rounded-md border border-light-300 px-3 py-2 text-sm"
          placeholder="Write your message..."
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="subscribe"
          type="checkbox"
          checked={form.subscribe}
          onChange={(e) => handleChange("subscribe", e.target.checked)}
          className="h-4 w-4 rounded border-light-300"
        />
        <label htmlFor="subscribe" className="text-sm text-dark-700">
          Sign me up for occasional product news and offers (optional)
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-dark-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send message"}
        </button>

        <div aria-live="polite" className="text-sm">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
      </div>

      {/* lightweight inline validation hints */}
      <div className="text-xs text-dark-600">
        {touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
          <p className="text-red-600">That email address looks invalid.</p>
        )}
        {touched.message && form.message.trim().length > 0 && form.message.trim().length < 10 && (
          <p className="text-red-600">Message is a bit short — please add a few more details.</p>
        )}
      </div>
    </form>
  );
}