import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiCall } from "../../utils/auth.js";
import "./ManageHome.css";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ManageHome() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Image states
    const [heroFile, setHeroFile] = useState(null);
    const [heroPreview, setHeroPreview] = useState("");
    const [featureFiles, setFeatureFiles] = useState([null, null, null, null]);
    const [featurePreviews, setFeaturePreviews] = useState(["", "", "", ""]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await apiCall(`${BASE}/api/home-page`);
            if (!res.ok) throw new Error("Failed to load settings");
            const data = await res.json();
            setSettings(data);
            
            // Set initial previews from server if they exist
            if (data.hero_image_url) {
                setHeroPreview(`${BASE}${data.hero_image_url}`);
            }
            if (data.features) {
                const previews = data.features.map(f => f.icon_url ? `${BASE}${f.icon_url}` : "");
                setFeaturePreviews(previews);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...settings.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setSettings(prev => ({ ...prev, features: newFeatures }));
    };

    const handleHeroFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeroFile(file);
            setHeroPreview(URL.createObjectURL(file));
        }
    };

    const handleFeatureFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newFiles = [...featureFiles];
            newFiles[index] = file;
            setFeatureFiles(newFiles);

            const newPreviews = [...featurePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setFeaturePreviews(newPreviews);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess("");
        setError("");

        try {
            const formData = new FormData();
            
            // Append all text fields
            Object.keys(settings).forEach(key => {
                if (key !== 'features' && key !== 'updated_at' && key !== 'id') {
                    formData.append(key, settings[key] || "");
                }
            });
            
            // Append features as JSON string
            formData.append('features', JSON.stringify(settings.features));

            // Append files
            if (heroFile) formData.append('hero_image', heroFile);
            featureFiles.forEach((file, idx) => {
                if (file) formData.append(`feature_${idx}`, file);
            });

            const res = await apiCall(`${BASE}/api/home-page`, {
                method: "PUT",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to save changes");
            
            setSuccess("Home page content and images updated successfully!");
            setTimeout(() => setSuccess(""), 5000);
            
            // Refresh to get new server paths
            fetchSettings();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="manage-home-container">Loading site settings...</div>;

    return (
        <div className="manage-home-container">
            <header className="page-header">
                <h1 className="manage-home-title">Manage Home Page Content</h1>
                <Link to="/admin/dashboard" className="cancel-link">← Back to Dashboard</Link>
            </header>

            {success && <div className="success-banner">{success}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSave} className="home-form">
                {/* ── Branding & Hero ── */}
                <div className="form-section shadow-premium">
                    <h3>Hero & Branding</h3>
                    <div className="form-group text-box-style">
                        <label>Company Name (Navbar)</label>
                        <input 
                            name="company_name" 
                            value={settings.company_name} 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="image-upload-wrapper">
                        <label>Hero Background Image</label>
                        <div className="image-preview-container">
                            {heroPreview ? (
                                <img src={heroPreview} alt="Hero Preview" className="image-preview" />
                            ) : (
                                <div className="image-placeholder">No image selected (Using default)</div>
                            )}
                        </div>
                        <div className="file-input-group">
                            <input 
                                type="file" 
                                id="hero_image" 
                                accept="image/*" 
                                onChange={handleHeroFileChange} 
                            />
                            <label htmlFor="hero_image" className="file-label">
                                Choose New Hero Image
                            </label>
                        </div>
                    </div>

                    <div className="form-group text-box-style" style={{marginTop: '20px'}}>
                        <label>Hero Welcome Title</label>
                        <input 
                            name="hero_title" 
                            value={settings.hero_title} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="form-group text-box-style">
                        <label>Hero Subtitle</label>
                        <textarea 
                            name="hero_subtitle" 
                            value={settings.hero_subtitle} 
                            onChange={handleChange} 
                            rows={2}
                        />
                    </div>
                    <div className="form-group text-box-style">
                        <label>Call to Action Button Text</label>
                        <input 
                            name="hero_button_text" 
                            value={settings.hero_button_text} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                {/* ── About Us ── */}
                <div className="form-section shadow-premium">
                    <h3>About Section</h3>
                    <div className="form-group text-box-style">
                        <label>About Title</label>
                        <input 
                            name="about_title" 
                            value={settings.about_title} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="form-group text-box-style">
                        <label>About Content</label>
                        <textarea 
                            name="about_content" 
                            value={settings.about_content} 
                            onChange={handleChange} 
                            rows={6}
                        />
                    </div>
                </div>

                {/* ── Features ── */}
                <div className="form-section shadow-premium">
                    <h3>Features Highlights</h3>
                    <div className="features-edit-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px'}}>
                        {settings.features.map((feature, idx) => (
                            <div key={idx} className="feature-edit-card shadow-premium">
                                <div className="feature-header">Feature #{idx + 1}</div>
                                
                                <div className="image-upload-wrapper" style={{marginBottom: '15px'}}>
                                    <div className="image-preview-container feature-preview">
                                        {featurePreviews[idx] ? (
                                            <img src={featurePreviews[idx]} alt={`Feature ${idx+1}`} className="image-preview" />
                                        ) : (
                                            <div className="image-placeholder">Default Icon</div>
                                        )}
                                    </div>
                                    <div className="file-input-group">
                                        <input 
                                            type="file" 
                                            id={`feature_${idx}`} 
                                            accept="image/*" 
                                            onChange={(e) => handleFeatureFileChange(idx, e)} 
                                        />
                                        <label htmlFor={`feature_${idx}`} className="file-label" style={{padding: '6px 12px', fontSize: '12px'}}>
                                            Change Icon
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group text-box-style" style={{border: 'none', padding: 0}}>
                                    <label>Title</label>
                                    <input 
                                        value={feature.title} 
                                        onChange={(e) => handleFeatureChange(idx, "title", e.target.value)} 
                                    />
                                </div>
                                <div className="form-group text-box-style" style={{border: 'none', padding: 0, marginTop: '10px'}}>
                                    <label>Description</label>
                                    <textarea 
                                        value={feature.description} 
                                        onChange={(e) => handleFeatureChange(idx, "description", e.target.value)} 
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Contact Info ── */}
                <div className="form-section shadow-premium">
                    <h3>Contact Information</h3>
                    <div className="form-group text-box-style">
                        <label>Address</label>
                        <input 
                            name="contact_address" 
                            value={settings.contact_address} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        <div className="form-group text-box-style">
                            <label>Mobile / Phone</label>
                            <input 
                                name="contact_phone" 
                                value={settings.contact_phone} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group text-box-style">
                            <label>Email Address</label>
                            <input 
                                name="contact_email" 
                                value={settings.contact_email} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                    <div className="form-group text-box-style">
                        <label>Business Hours</label>
                        <input 
                            name="contact_hours" 
                            value={settings.contact_hours} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="save-actions">
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? "Saving Changes..." : "Publish Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
