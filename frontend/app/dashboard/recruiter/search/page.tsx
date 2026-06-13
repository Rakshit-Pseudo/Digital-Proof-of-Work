'use client';

import { useState } from 'react';
import { Search, Download, Bookmark, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { searchApi, recruiterApi, reportsApi, usersApi } from '@/lib/api';
import { User } from '@/types';
import { downloadPdf } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard/recruiter', label: 'Overview' },
  { href: '/dashboard/recruiter/search', label: 'Search Students' },
  { href: '/dashboard/recruiter/saved', label: 'Saved Candidates' },
];

interface StudentResult extends User {
  stats?: { projectCount: number; approvedProjects: number; certCount: number; badgeCount: number };
}

export default function RecruiterSearchPage() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    q: '', skills: '', education: '', verificationStatus: '', minProfileCompletion: '', sortBy: 'createdAt', sortOrder: 'desc', page: '1',
  });

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await searchApi.students({ ...filters, page: String(page), limit: '10' });
      setResults(data.data);
      setPagination({ page: data.pagination.page, total: data.pagination.total, pages: data.pagination.pages || 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (studentId: string) => {
    await recruiterApi.saveCandidate({ studentId });
    alert('Candidate saved!');
  };

  const handleDownload = async (studentId: string, name: string) => {
    const { data } = await reportsApi.downloadStudent(studentId);
    await downloadPdf(data, `dpow-${name.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Search Students</h2>

        <div className="card p-5">
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="label">Search</label>
              <input className="input" placeholder="Name, skills, bio..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            </div>
            <div>
              <label className="label">Skills</label>
              <input className="input" placeholder="React, Python..." value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })} />
            </div>
            <div>
              <label className="label">Education</label>
              <input className="input" placeholder="University name..." value={filters.education} onChange={(e) => setFilters({ ...filters, education: e.target.value })} />
            </div>
            <div>
              <label className="label">Verification Status</label>
              <select className="input" value={filters.verificationStatus} onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}>
                <option value="">Any</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="label">Min Profile %</label>
              <input type="number" className="input" min="0" max="100" value={filters.minProfileCompletion} onChange={(e) => setFilters({ ...filters, minProfileCompletion: e.target.value })} />
            </div>
            <div>
              <label className="label">Sort By</label>
              <select className="input" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
                <option value="createdAt">Date Joined</option>
                <option value="profileCompletion">Profile Completion</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="label">Order</label>
              <select className="input" value={filters.sortOrder} onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          <button onClick={() => handleSearch(1)} className="btn-primary">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : results.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">Search for students to see results</div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{pagination.total} students found</p>
            <div className="space-y-4">
              {results.map((student) => (
                <div key={student._id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      {student.bio && <p className="text-sm text-gray-600 mt-1">{student.bio}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                        <span>{student.stats?.approvedProjects ?? 0} verified projects</span>
                        <span>·</span>
                        <span>{student.stats?.certCount ?? 0} certificates</span>
                        <span>·</span>
                        <span>{student.profileCompletion ?? 0}% profile</span>
                      </div>
                      {student.skills?.length ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {student.skills.slice(0, 8).map((s) => (
                            <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/dashboard/recruiter/portfolio/${student._id}`} className="btn-secondary text-xs">
                        <Eye className="w-3 h-3" /> View
                      </Link>
                      <button onClick={() => handleSave(student._id)} className="btn-secondary text-xs">
                        <Bookmark className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => handleDownload(student._id, student.name)} className="btn-primary text-xs">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex gap-2 justify-center">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSearch(p)}
                    className={`px-3 py-1 rounded text-sm ${p === pagination.page ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
