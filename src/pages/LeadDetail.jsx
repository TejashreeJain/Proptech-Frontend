import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadAPI } from '../services/api';

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

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getById(id);
      setLead(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lead not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdating(true);
      const res = await leadAPI.update(id, { status: newStatus });
      setLead(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setNoteError('Note cannot be empty');
      return;
    }
    try {
      const res = await leadAPI.addNote(id, noteText.trim());
      setLead(res.data.data);
      setNoteText('');
      setNoteError('');
    } catch (err) {
      setNoteError(err.response?.data?.message || 'Failed to add note');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadAPI.delete(id);
      navigate('/leads');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading lead...</div>;
  if (error) return <div className="card"><p className="error-text">{error}</p></div>;
  if (!lead) return null;

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/leads')} style={{ marginBottom: 16 }}>
        ← Back to Leads
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
          <div>
            <h2>{lead.name}</h2>
            <span className={statusBadgeClass(lead.status)} style={{ marginTop: 8, display: 'inline-block' }}>
              {lead.status}
            </span>
          </div>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>

        <div className="form-grid">
          <div><strong>Phone:</strong> {lead.phone}</div>
          <div><strong>Email:</strong> {lead.email}</div>
          <div><strong>Budget:</strong> ₹{Number(lead.budget).toLocaleString('en-IN')}</div>
          <div><strong>Location:</strong> {lead.location}</div>
          <div><strong>Property Type:</strong> {lead.propertyType}</div>
          <div><strong>Source:</strong> {lead.source}</div>
          <div><strong>Created:</strong> {new Date(lead.createdAt).toLocaleString()}</div>
          <div><strong>Last Updated:</strong> {new Date(lead.updatedAt).toLocaleString()}</div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Update Status:</label>
          <select
            value={lead.status}
            onChange={handleStatusChange}
            disabled={updating}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db', minWidth: 200 }}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Notes section */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📝 Notes & Comments</h3>

        <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
          <div className="form-group">
            <textarea
              rows="3"
              placeholder="Add a note or comment..."
              value={noteText}
              onChange={(e) => { setNoteText(e.target.value); setNoteError(''); }}
            />
            {noteError && <span className="error-text">{noteError}</span>}
          </div>
          <button type="submit" className="btn btn-success">Add Note</button>
        </form>

        <div className="notes-list">
          {lead.notes.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              No notes yet. Add the first one above.
            </p>
          ) : (
            // Show newest first
            [...lead.notes].reverse().map((note) => (
              <div key={note._id} className="note-item">
                <div>{note.text}</div>
                <div className="note-date">{new Date(note.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
