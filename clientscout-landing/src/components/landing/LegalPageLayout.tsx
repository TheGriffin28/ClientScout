import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageLayoutProps) => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12">
          <header className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
          </header>

          <div className="space-y-8 text-slate-600 leading-relaxed">{children}</div>
        </article>
      </div>
    </div>
  );
};

export default LegalPageLayout;
