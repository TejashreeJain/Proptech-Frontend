import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { leadAPI } from '../services/api';

const COLORS = ['#1e40af', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="card"><p className="error-text">{error}</p></div>;
  if (!metrics) return null;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>📊 Dashboard</h2>

      {/* Metric cards */}
      <div className="metrics-grid">
        <div
          className="metric-card clickable"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/leads')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/leads')}
        >
          <h3>Total Leads</h3>
          <div className="value">{metrics.totalLeads}</div>
        </div>
        <div
          className="metric-card clickable"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/leads?status=Closed')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/leads?status=Closed')}
        >
          <h3>Closed Leads</h3>
          <div className="value">{metrics.closedCount}</div>
        </div>
        <div
          className="metric-card clickable"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/leads?status=Closed')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/leads?status=Closed')}
        >
          <h3>Conversion Rate</h3>
          <div className="value">{metrics.conversionRate}%</div>
        </div>
        <div
          className="metric-card clickable"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/leads')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/leads')}
        >
          <h3>Active Sources</h3>
          <div className="value">{metrics.leadsBySource.length}</div>
        </div>
      </div>

      {/* Charts */}
      {metrics.totalLeads === 0 ? (
        <div className="card empty-state">
          <p>No leads yet. Add some leads to see analytics.</p>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Leads by Source</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={metrics.leadsBySource}
                  dataKey="count"
                  nameKey="source"
                  outerRadius={90}
                  label={(e) => `${e.source}: ${e.count}`}
                >
                  {metrics.leadsBySource.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
