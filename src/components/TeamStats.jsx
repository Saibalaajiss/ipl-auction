import React from 'react';
import './TeamStats.css';

const TeamStats = ({ teams, isFullScreen = false }) => {
    const sortedTeams = [...teams].sort((a, b) => b.purse - a.purse);

    return (
        <div className={`team-stats ${isFullScreen ? 'fullscreen' : ''}`}>
            <h2>Team Statistics</h2>
            <div className="stats-grid">
                <div className="stats-header">
                    <span>Team</span>
                    <span>Purse Left</span>
                    <span>Players</span>
                </div>
                {sortedTeams.map(team => (
                    <div key={team.name} className="stats-row">
                        <span className="team-name">{team.name}</span>
                        <span className="team-purse">₹{(team.purse / 10000000).toFixed(2)} Cr</span>
                        <span className="team-players">{team.players.length}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamStats; 