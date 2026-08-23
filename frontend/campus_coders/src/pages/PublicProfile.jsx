import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiBriefcase } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/client';

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get(`/profile/public/${userId}`);
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('This profile is private.');
        } else if (err.response?.status === 404) {
          setError('Profile not found.');
        } else {
          setError('Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', color: '#64748b' }}>Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px' }}>
          <h2>{error || 'Profile not available'}</h2>
          <Link to="/dashboard" style={{ color: '#c5a365', textDecoration: 'none' }}>Return to Dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }

  const userInitials = profile.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <DashboardLayout>
      <div className="sett-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="sett-user-card" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
          <div className="sett-user-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', marginBottom: '20px' }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <h2 style={{ margin: '0 0 8px 0' }}>{profile.fullName || 'Student'}</h2>
          {profile.university && (
            <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '1.1rem' }}>{profile.university}</p>
          )}
          
          {profile.bio && (
            <p style={{ color: '#334155', maxWidth: '600px', lineHeight: '1.6', marginBottom: '24px' }}>
              {profile.bio}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiGithub /> GitHub
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiLinkedin /> LinkedIn
              </a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBriefcase /> Portfolio
              </a>
            )}
            {profile.leetcodeUrl && (
              <a href={profile.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                LeetCode
              </a>
            )}
            {profile.geeksforgeeksUrl && (
              <a href={profile.geeksforgeeksUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                GeeksForGeeks
              </a>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
