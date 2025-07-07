import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Home.css';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/games');
        setGames(response.data.data || response.data); // Handle both new and old API format
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleDownload = async (game) => {
    try {
      // Get download URL from API
      const response = await api.get(`/games/${game._id}/download`);
      const { downloadUrl, fileName } = response.data.data;
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || game.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>Game Share</h1>
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Game Share</h1>
        <div className="error">{error}</div>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Game Share</h1>
      {games.length === 0 ? (
        <div className="empty-state">
          <p>No games available yet.</p>
          <p>Be the first to upload a game!</p>
        </div>
      ) : (
        <div className="grid">
          {games.map(game => (
            <div key={game._id} className="card">
              <img 
                src={game.imageUrl} 
                alt={`${game.title} thumbnail`} 
                className="thumb"
                onError={(e) => {
                  e.target.src = '/placeholder-game.png';
                  e.target.alt = 'Game thumbnail not available';
                }}
              />
              <h3 className="game-title">{game.title}</h3>
              <p className="uploader">By: {game.uploaderName || game.uploader?.name || 'Unknown'}</p>
              <div className="game-stats">
                <span className="downloads">📥 {game.downloads || 0} downloads</span>
                {game.rating && game.rating.count > 0 && (
                  <span className="rating">⭐ {game.rating.average / game.rating.count} ({game.rating.count})</span>
                )}
              </div>
              <button 
                onClick={() => handleDownload(game)}
                className="btn-download"
                aria-label={`Download ${game.title}`}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
