import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadForm from '../components/LeadForm';
import { leadAPI } from '../services/api';

export default function AddLead() {
  const navigate = useNavigate();
  const [duplicateInfo, setDuplicateInfo] = useState(null); // { duplicates, formData }

  const handleSubmit = async (data) => {
    try {
      const res = await leadAPI.create(data);
      navigate(`/leads/${res.data.data._id}`);
    } catch (err) {
      // 409 = duplicate detected by backend
      if (err.response?.status === 409 && err.response.data.duplicates) {
        setDuplicateInfo({
          duplicates: err.response.data.duplicates,
          formData: data,
        });
        return; // swallow — modal handles it from here
      }
      throw err; // other errors bubble up to LeadForm's error handler
    }
  };

  const handleForceCreate = async () => {
    try {
      const res = await leadAPI.forceCreate(duplicateInfo.formData);
      navigate(`/leads/${res.data.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleViewExisting = (id) => {
    navigate(`/leads/${id}`);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>+ Add New Lead</h2>
      <div className="card">
        <LeadForm onSubmit={handleSubmit} submitLabel="Create Lead" />
      </div>

      {duplicateInfo && (
        <div className="modal-overlay" onClick={() => setDuplicateInfo(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Duplicate Lead Detected</h3>
              <button
                className="btn btn-secondary"
                onClick={() => setDuplicateInfo(null)}
                style={{ padding: '4px 10px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ marginBottom: 16 }}>
              A lead with this phone or email already exists. Please review:
            </p>

            <div style={{ marginBottom: 20 }}>
              {duplicateInfo.duplicates.map((d) => (
                <div
                  key={d._id}
                  className="note-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewExisting(d._id)}
                >
                  <div><strong>{d.name}</strong></div>
                  <div style={{ fontSize: 13 }}>📞 {d.phone} | ✉️ {d.email}</div>
                  <div className="note-date">
                    Added {new Date(d.createdAt).toLocaleDateString()} — click to view
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDuplicateInfo(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleForceCreate}>
                Create Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
