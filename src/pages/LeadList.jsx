import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { leadAPI } from '../services/api';

const SOURCES = ['Facebook', 'Google', 'Referral', 'Walk-in', 'Website', 'Other'];
const STATUSES = ['New', 'Contacted', 'Site Visit', 'Closed'];

const statusBadgeClass = (status) => {
  const map = {
    'New': 'badge-new',
    'Contacted': 'badge-contacted',
    'Site Visit': 'badge-sitevisit',
    'Closed': 'badge-closed',
  };
  return `badge ${map[status] || 'badge-new'}`;
};

export default function LeadList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state — initialize from URL query params so deep-links from Dashboard cards work
  const [search, setSearch] = useState('');
  const [source, setSource] = useState(() => searchParams.get('source') || 'all');
  const [status, setStatus] = useState(() => searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, source, status, sortBy, order]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, source, status, sortBy, order, page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAll({ search, source, status, sortBy, order, page, limit: LIMIT });
      setLeads(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>All Leads {total > 0 && <span className="total-count">({total})</span>}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/leads/new')}>
          + Add Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">All Sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Date</option>
          <option value="budget">Sort: Budget</option>
          <option value="name">Sort: Name</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {error && <div className="card"><p className="error-text">{error}</p></div>}

      {loading ? (
        <div className="loading">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="card empty-state">
          <p>No leads found. Try adjusting filters or add a new lead.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Budget</th>
                  <th>Location</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}>
                    <td><strong>{lead.name}</strong></td>
                    <td>
                      <div style={{ fontSize: 13 }}>{lead.phone}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{lead.email}</div>
                    </td>
                    <td>{formatBudget(lead.budget)}</td>
                    <td>{lead.location}</td>
                    <td>{lead.source}</td>
                    <td><span className={statusBadgeClass(lead.status)}>{lead.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <div className="pagination-info">
                Page {page} of {totalPages}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
