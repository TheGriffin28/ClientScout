import { Mail, Send, Loader2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const CONTACT_EMAIL = 'clientscoute@gmail.com';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    formData.append('_captcha', 'false');
    formData.append('_subject', `New Contact from ${formData.get('name')}`);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setIsSuccess(true);
        e.currentTarget.reset();
      } else {
        setError('Something went wrong. Please try again or email us directly.');
      }
    } catch {
      setError('Network error. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Contact Us</h1>
          <p className="text-lg text-slate-600">Questions about ClientScout? We&apos;re here to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Get in touch</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Send us a message using the form, or email us directly. We typically reply within 1–2 business days.
            </p>

            <div className="flex items-start gap-4 rounded-xl border border-teal-100 bg-teal-50/50 p-5">
              <div className="p-3 bg-teal-100 rounded-lg text-teal-600 shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-teal-700 font-medium hover:text-teal-800 hover:underline break-all"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message sent!</h3>
                <p className="text-slate-600 mb-8">
                  Thanks for reaching out. We&apos;ll get back to you at the email you provided.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-teal-600 font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-y"
                    placeholder="How can we help?"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      Sending... <Loader2 size={18} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Send message <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
