import React from 'react';
import { useProfile } from '../../contexts/ProfileContext';

const UserProfile = () => {
  const { profile, loading, error } = useProfile();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>Aucune donnée disponible</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <img
        src={profile.avatar_url || '/default-avatar.png'}
        alt="Avatar"
        className="w-24 h-24 rounded-full mb-4"
      />
      <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
      <p className="text-gray-600 mb-2">Email: {profile.email}</p>
      <p className="text-gray-600 mb-2">Rôle: {profile.role}</p>
      {profile.job_title && <p className="text-gray-600 mb-2">Poste: {profile.job_title}</p>}
      {profile.company && <p className="text-gray-600 mb-2">Entreprise: {profile.company}</p>}
      {profile.bio && <p className="text-gray-600 mb-2">Bio: {profile.bio}</p>}
    </div>
  );
};

export default UserProfile;
