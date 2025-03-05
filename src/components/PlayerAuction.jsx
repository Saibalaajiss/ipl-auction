import React, { useState, useEffect } from 'react';
import './PlayerAuction.css';
import Papa from 'papaparse';

const PlayerAuction = () => {
    const [currentBid, setCurrentBid] = useState(0);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [teams, setTeams] = useState([
        { name: 'Chennai Super Kings', purse: 1000000000, players: [] },
        { name: 'Delhi Capitals', purse: 1000000000, players: [] },
        { name: 'Gujarat Titans', purse: 1000000000, players: [] },
        { name: 'Kolkata Knight Riders', purse: 1000000000, players: [] },
        { name: 'Lucknow Super Giants', purse: 1000000000, players: [] },
        { name: 'Mumbai Indians', purse: 1000000000, players: [] },
        { name: 'Punjab Kings', purse: 1000000000, players: [] },
        { name: 'Rajasthan Royals', purse: 1000000000, players: [] },
        { name: 'Royal Challengers Bangalore', purse: 1000000000, players: [] },
        { name: 'Sunrisers Hyderabad', purse: 1000000000, players: [] }
    ]);

    useEffect(() => {
        const loadPlayers = async () => {
            try {
                const response = await fetch('/players.csv');
                const csvText = await response.text();
                
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const parsedPlayers = results.data.map(player => ({
                            Name: player.Name,
                            Category: player.Category,
                            Role: player.Role,
                            BasePrice: parseInt(player.BasePrice),
                            Points: parseInt(player.Points),
                            Country: player.Country,
                            stats: {
                                matches: parseInt(player.Matches),
                                runs: parseInt(player.Runs),
                                average: parseFloat(player.Average),
                                strikeRate: parseFloat(player.StrikeRate)
                            }
                        }));
                        setPlayers(parsedPlayers);
                        setLoading(false);
                    }
                });
            } catch (err) {
                console.error('Error loading players:', err);
                setLoading(false);
            }
        };

        loadPlayers();
    }, []);

    const handleBid = () => {
        if (currentBid === 0) {
            // If it's the first bid, start with base price
            const basePrice = players[currentPlayerIndex]?.BasePrice || 0;
            setCurrentBid(basePrice);
        } else {
            // Increment by 1 Cr (10000000)
            setCurrentBid(prev => prev + 10000000);
        }
    };

    const handleTeamSelect = (e) => {
        setSelectedTeam(e.target.value);
    };

    const handleSold = () => {
        if (selectedTeam && currentBid > 0) {
            setTeams(prevTeams => prevTeams.map(team => {
                if (team.name === selectedTeam) {
                    return {
                        ...team,
                        purse: team.purse - currentBid,
                        players: [...team.players, { ...players[currentPlayerIndex], soldFor: currentBid }]
                    };
                }
                return team;
            }));
            
            // Move to next player
            setCurrentPlayerIndex(prev => prev + 1);
            // Reset bid and selection
            setCurrentBid(0);
            setSelectedTeam('');
        }
    };

    const handleSkip = () => {
        setCurrentPlayerIndex(prev => prev + 1);
        setCurrentBid(0);
        setSelectedTeam('');
    };

    if (loading) {
        return <div className="loading">Loading players...</div>;
    }

    const currentPlayer = players[currentPlayerIndex];
    
    if (!currentPlayer) {
        return <div className="auction-complete">
            <h2>Auction Complete!</h2>
            <div className="final-standings">
                {teams.map(team => (
                    <div key={team.name} className="team-summary">
                        <h3>{team.name}</h3>
                        <p>Remaining Purse: ₹{(team.purse / 10000000).toFixed(2)} Cr</p>
                        <p>Players Bought: {team.players.length}</p>
                    </div>
                ))}
            </div>
        </div>;
    }

    return (
        <div className="auction-container">
            <div className="main-content">
                <div className="player-info">
                    <h1 className="player-name">{currentPlayer.Name}</h1>
                    <div className="player-details">
                        <p>Role: {currentPlayer.Role}</p>
                        <p>Country: {currentPlayer.Country}</p>
                        <p>Base Price: ₹{(currentPlayer.BasePrice / 10000000).toFixed(2)}M</p>
                    </div>
                    <div className="player-stats">
                        <div className="stat">
                            <span>Matches</span>
                            <span>{currentPlayer.stats.matches}</span>
                        </div>
                        <div className="stat">
                            <span>Runs</span>
                            <span>{currentPlayer.stats.runs}</span>
                        </div>
                        <div className="stat">
                            <span>Average</span>
                            <span>{currentPlayer.stats.average}</span>
                        </div>
                        <div className="stat">
                            <span>Strike Rate</span>
                            <span>{currentPlayer.stats.strikeRate}</span>
                        </div>
                    </div>
                </div>
                
                <div className="current-bid">
                    <h2>Current Bid</h2>
                    <div className="bid-amount">₹{(currentBid / 10000000).toFixed(2)}M</div>
                </div>

                <button 
                    className="bid-button" 
                    onClick={() => {
                        if (currentBid === 0) {
                            setCurrentBid(currentPlayer.BasePrice);
                        } else {
                            setCurrentBid(prev => prev + 10000000);
                        }
                    }}
                    disabled={selectedTeam && teams.find(t => t.name === selectedTeam)?.purse < (currentBid + 10000000)}
                >
                    {currentBid === 0 ? 'Start Bidding' : '+1 Cr'}
                </button>

                <select 
                    className="team-select"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                >
                    <option value="">Select Team</option>
                    {teams.map(team => (
                        <option 
                            key={team.name} 
                            value={team.name}
                            disabled={team.purse < currentBid}
                        >
                            {team.name} (₹{(team.purse / 10000000).toFixed(2)} Cr)
                        </option>
                    ))}
                </select>

                <div className="action-buttons">
                    <button 
                        className="sold-button"
                        onClick={() => {
                            if (selectedTeam && currentBid > 0) {
                                setTeams(prevTeams => prevTeams.map(team => 
                                    team.name === selectedTeam 
                                        ? {
                                            ...team,
                                            purse: team.purse - currentBid,
                                            players: [...team.players, { ...currentPlayer, soldFor: currentBid }]
                                        }
                                        : team
                                ));
                                setCurrentPlayerIndex(prev => prev + 1);
                                setCurrentBid(0);
                                setSelectedTeam('');
                            }
                        }}
                        disabled={!selectedTeam || currentBid === 0}
                    >
                        SOLD
                    </button>
                    <button 
                        className="skip-button"
                        onClick={() => {
                            setCurrentPlayerIndex(prev => prev + 1);
                            setCurrentBid(0);
                            setSelectedTeam('');
                        }}
                    >
                        SKIP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerAuction; 