import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import type { ContactSubmission, SchoolDatabase } from '../shared/types';

interface ContactPageProps {
  db: SchoolDatabase;
}

export const ContactPage: React.FC<ContactPageProps> = ({ db }) => {
  const { profile } = db;
  const [senderName, setSenderName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [role, setRole] = useState<ContactSubmission['role']>('Parent / Guardian');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const whatsappDigits = profile.whatsapp.replace(/\D/g, '').replace(/^0/, '233');
  const telDigits = profile.telephone.replace(/\D/g, '').replace(/^0/, '+233');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName, phoneOrEmail, role, subject, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send message.');
      setSubmitted(true);
      setSenderName('');
      setPhoneOrEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 space-y-3 max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
          Contact Us · Nkurakan, Yilo Krobo Municipality
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
          Reach Nkurakan R/C JHS
        </h1>
        <p className="text-base text-[#4A5568] leading-relaxed">
          Connect directly with the school administration via WhatsApp, telephone, or our official
          inquiry form below.
        </p>
      </div>

      {/* Direct Contact Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Direct Channels */}
        <div className="lg:col-span-5 space-y-5">
          {/* WhatsApp Card */}
          <div className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#0F2342] text-[#E5D399] flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase text-[#721C2E]">Official WhatsApp</p>
                <p className="font-serif text-2xl font-bold text-[#0F2342] tabular-nums mt-0.5">
                  {profile.whatsapp}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Quick inquiries from parents, guardians, and community members.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Telephone Card */}
          <div className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#721C2E] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase text-[#721C2E]">School Telephone</p>
                <p className="font-serif text-2xl font-bold text-[#0F2342] tabular-nums mt-0.5">
                  {profile.telephone}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Direct voice line during school administrative hours.
                </p>
              </div>
            </div>
            <a
              href={`tel:${telDigits}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-[#0F2342] hover:bg-[#1B3664] text-white rounded-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now ({profile.telephone})</span>
            </a>
          </div>

          {/* Location Card */}
          <div className="bg-[#F3EFE6] border border-[#E5DFD3] rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#721C2E] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase text-[#721C2E]">Campus Location</p>
                <p className="font-semibold text-base text-[#0F2342]">{profile.fullName}</p>
                <p className="text-sm text-[#4A5568]">{profile.location}</p>
                <p className="text-xs text-slate-500 pt-1">
                  Parish Partner: {profile.parishPartner}
                </p>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Nkurakan%2C+Yilo+Krobo%2C+Eastern+Region%2C+Ghana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#721C2E] hover:underline pt-1"
            >
              <span>Locate Nkurakan on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="border-b border-[#E5DFD3] pb-4 mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342]">
              Send a Message to the School Office
            </h2>
            <p className="text-sm text-[#4A5568] mt-1">
              Messages submitted here are delivered directly to the Headteacher&apos;s Inbox in the
              School Portal.
            </p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Message Received</p>
                <p>
                  Thank you for contacting {profile.name}. For urgent matters, please call{' '}
                  {profile.telephone} or reach us on WhatsApp ({profile.whatsapp}).
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Phone Number or Email *
                </label>
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="e.g. 024..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  I am a...
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ContactSubmission['role'])}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
                >
                  <option value="Parent / Guardian">Parent / Guardian</option>
                  <option value="Student">Student</option>
                  <option value="Community Member">Community Member</option>
                  <option value="GES / Official">GES / Education Official</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Admissions, PTA, Student Welfare"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2342] mb-1">Message *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message for the Headteacher or school office..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
