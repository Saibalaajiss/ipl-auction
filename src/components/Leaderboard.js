import React, { useState } from 'react';
import './Leaderboard.css';

const Leaderboard = ({ teams, isFinal }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Sort teams by total points
  const sortedTeams = [...teams].sort((a, b) => {
    const aPoints = a.players.reduce((sum, player) => sum + player.points, 0);
    const bPoints = b.players.reduce((sum, player) => sum + player.points, 0);
    if (bPoints === aPoints) {
      return b.purse - a.purse;
    }
    return bPoints - aPoints;
  });

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">
        {isFinal ? 'Final Auction Results' : 'Current Standings'}
      </h2>
      
      <div className="teams-grid">
        {sortedTeams.map((team, index) => {
          const totalPoints = team.players.reduce((sum, player) => sum + player.points, 0);
          
          return (
            <div 
              key={team.name} 
              className="team-card"
              data-team={team.name}
            >
              <div className="team-header">
                <div className="rank">#{index + 1}</div>
                <div className="team-name">{team.name}</div>
                <div className="team-points">
                  Points: {totalPoints}
                </div>
              </div>

              <div className="team-stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Purse Remaining</div>
                  <div className="stat-value">₹{(team.purse / 10000000).toFixed(2)} Cr</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Players</div>
                  <div className="stat-value">{team.players.length}</div>
                </div>
              </div>

              <div className="squad-section">
                <h3 className="squad-title">Squad</h3>
                <div className="players-list">
                  {team.players.map((player, idx) => (
                    <div key={idx} className="player-row">
                      <span className="player-name">{player.name}</span>
                      <div className="player-details">
                        <span>Points: {player.points}</span>
                        <span>₹{(player.soldFor / 10000000).toFixed(2)} Cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard; 