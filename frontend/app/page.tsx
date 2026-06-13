import Link from 'next/link';
import { Shield, Search, Award, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-900">DPOW</span>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary">Sign in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-brand-900 mb-4">
          Digital Proof of Work
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Verify your skills, showcase verified projects, and connect with recruiters through AI-powered portfolio analysis.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="btn-primary text-base px-6 py-3">
            Create Portfolio
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Sign In
          </Link>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Verified Credentials', desc: 'Projects and certificates verified by trusted verifiers' },
            { icon: Search, title: 'Recruiter Search', desc: 'Advanced filters to find talent by skills and badges' },
            { icon: Award, title: 'AI Badges', desc: 'Earn badges based on your activity and achievements' },
            { icon: BarChart3, title: 'Analytics', desc: 'Track profile completion and verification status' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 text-center">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
