// src/App.tsx
import React, { useState } from 'react';
import { EyeOff, MessageCircle, Heart, CheckCircle2, ImageOff } from 'lucide-react';
import { supabase } from './supabase';
import './App.css';

function App() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [interest, setInterest] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.from('waitlist').insert({
        first_name: firstName,
        email: normalizedEmail,
        location,
        interest
      });

      if (error) {
        // Handle Postgres unique violation
        if (error.code === '23505') {
          setStatus({
            type: 'error',
            message: "You're already on the waitlist with this email address!"
          });
        } else {
          setStatus({
            type: 'error',
            message: "Something went wrong. Please try again."
          });
          console.error("Supabase insert error:", error);
        }
      } else {
        setStatus({
          type: 'success',
          message: "You're on the list! We'll notify you when we launch."
        });
        setFirstName('');
        setEmail('');
        setLocation('');
        setInterest('');
      }
    } catch (err) {
      console.error("Unknown exception:", err);
      setStatus({
        type: 'error',
        message: "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo">GO BLIND</div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="section hero-section">
          <h1 className="hero-title">Dating without photos.<br/>Get to know the person first.</h1>
          <p className="hero-subtitle">
            A revolutionary new way to connect. We focus on personality, values, and genuine 
            compatibility instead of endless swiping on superficial traits.
          </p>

          <div className="waitlist-form-container">
            <h2 className="form-title">Join the Waitlist</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">First Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Alex" 
                  required 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="alex@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">City or Region</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. New York City" 
                  required 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">I'm interested in</label>
                <select 
                  className="form-select" 
                  required 
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                >
                  <option value="" disabled>Select an option</option>
                  <option value="Meeting people based on personality">Meeting people based on personality</option>
                  <option value="Making new friends">Making new friends</option>
                  <option value="Finding a serious relationship">Finding a serious relationship</option>
                  <option value="Still figuring it out">Still figuring it out</option>
                  <option value="Expanding my social circle">Expanding my social circle</option>
                </select>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Joining...' : 'Get Early Access'}
              </button>
            </form>

            {status && (
              <div className={`status-message status-${status.type}`}>
                {status.message}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <h2 className="benefits-title" style={{textAlign: 'center'}}>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <EyeOff className="feature-icon" size={32} />
              <h3 className="feature-title">Build your profile</h3>
              <p className="feature-desc">Focus on answering deep questions about your values, beliefs, and lifestyle without uploading any photos.</p>
            </div>
            
            <div className="feature-card">
              <Heart className="feature-icon" size={32} />
              <h3 className="feature-title">Discover matches</h3>
              <p className="feature-desc">Our intelligent engine surfaces highly compatible people based exclusively on shared alignment.</p>
            </div>

            <div className="feature-card">
              <MessageCircle className="feature-icon" size={32} />
              <h3 className="feature-title">Start a conversation</h3>
              <p className="feature-desc">Break the ice through personality-focused prompts. Let a genuine connection form before physical traits are introduced.</p>
            </div>

            <div className="feature-card">
              <ImageOff className="feature-icon" size={32} />
              <h3 className="feature-title">No photos needed</h3>
              <p className="feature-desc">Remove the pressure of superficial swiping. Build attraction entirely around aligned values and engaging conversation.</p>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="section benefits-section">
          <h2 className="benefits-title">Why go blind?</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <CheckCircle2 className="benefit-icon" size={24} />
              <span className="benefit-text">No photo pressure or superficial judging</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 className="benefit-icon" size={24} />
              <span className="benefit-text">Deeper profiles focused on your true self</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 className="benefit-icon" size={24} />
              <span className="benefit-text">Compatibility-first interactions over endless swiping</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-text">&copy; {new Date().getFullYear()} Go Blind. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
