import { useState } from 'react';
import { apiCall } from '../../../utils/auth.js';
import customerService from '../../../services/customerService.js';


export default function Feedback() {
  const [feedback, setFeedback] = useState({
    fabricQuality: 0,
    delivery: 0,
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback.fabricQuality === 0 && feedback.delivery === 0 && !feedback.comments) {
      setError('Please provide at least one rating or a comment before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await customerService.submitFeedback({
        fabric_quality: feedback.fabricQuality || null,
        delivery: feedback.delivery || null,
        comments: feedback.comments || null
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({ value, onChange, label }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '10px', fontWeight: '500' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)}
            style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: star <= value ? '#fbbf24' : '#e5e7eb', transition: 'color 0.15s' }}>
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Thank You for Your Feedback!</h2>
        <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '30px' }}>Your review helps us serve you better.</p>
        <button
          onClick={() => { setSubmitted(false); setFeedback({ fabricQuality: 0, delivery: 0, comments: '' }); }}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>Feedback</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Share your experience with us and help us improve.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '25px' }}>Share Your Experience</h2>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#991b1b', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Detailed Ratings */}
            <div style={{ marginBottom: '30px' }}>
              <RatingStars value={feedback.fabricQuality} onChange={(val) => setFeedback({ ...feedback, fabricQuality: val })} label="Fabric Quality" />
              <RatingStars value={feedback.delivery} onChange={(val) => setFeedback({ ...feedback, delivery: val })} label="Delivery Service" />
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '10px', fontWeight: '500' }}>Additional Comments</label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                placeholder="Tell us more about your experience..."
                rows="5"
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={submitting}
              style={{ background: submitting ? '#86efac' : '#22c55e', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600', width: '100%' }}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Why Feedback Matters */}
        <div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '25px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>Why Your Feedback Matters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[['📈', 'Helps us improve our products and services'], ['🎯', 'Guides our future fabric selections'], ['🤝', 'Helps other customers make informed decisions'], ['💡', 'Shapes our customer experience']].map(([icon, text]) => (
                <div key={icon}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>{icon}</div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '10px' }}>💙 Thank You!</h3>
            <p style={{ fontSize: '14px', color: '#0c4a6e', lineHeight: '1.6' }}>
              Your feedback helps us serve you better. We read every review and use your insights to continuously improve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
