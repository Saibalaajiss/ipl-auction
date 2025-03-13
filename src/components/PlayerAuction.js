import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './PlayerAuction.css';
import Leaderboard from './Leaderboard';

const PlayerAuction = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [previousCategory, setPreviousCategory] = useState('');
  const [isAuctionComplete, setIsAuctionComplete] = useState(false);
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [teams, setTeams] = useState([
    { name: 'Chennai Super Kings', purse: 1200000000, players: [] },
    { name: 'Delhi Capitals', purse: 1200000000, players: [] },
    { name: 'Gujarat Titans', purse: 1200000000, players: [] },
    { name: 'Kolkata Knight Riders', purse: 1200000000, players: [] },
    { name: 'Lucknow Super Giants', purse: 1200000000, players: [] },
    { name: 'Mumbai Indians', purse: 1200000000, players: [] },
    { name: 'Punjab Kings', purse: 1200000000, players: [] },
    { name: 'Rajasthan Royals', purse: 1200000000, players: [] },
    { name: 'Royal Challengers Bangalore', purse: 1200000000, players: [] },
    { name: 'Sunrisers Hyderabad', purse: 1200000000, players: [] }
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
            const parsedPlayers = results.data.map((player, index) => ({
              id: index + 1,
              name: player.Name,
              role: player.Role,
              country: player.Country,
              category: player.Category,
              basePrice: parseInt(player.BasePrice),
              points: parseInt(player.Points),
              stats: {
                matches: parseInt(player.Matches),
                runs: parseInt(player.Runs),
                average: parseFloat(player.Average),
                strikeRate: parseFloat(player.StrikeRate)
              }
            }));
            setPlayers(parsedPlayers);
            setFilteredPlayers(parsedPlayers);
            if (parsedPlayers.length > 0) {
              setCurrentCategory(parsedPlayers[0].category);
            }
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
      setShowSearchResults(false);
      return;
    }

    const filtered = players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPlayers(filtered);
    setShowSearchResults(true);
  }, [searchQuery, players]);

  useEffect(() => {
    if (players.length === 0) return;

    if (currentPlayerIndex > 0) {
      const currentPlayer = players[currentPlayerIndex];
      const previousPlayer = players[currentPlayerIndex - 1];

      if (currentPlayer && previousPlayer && currentPlayer.category !== previousPlayer.category) {
        setPreviousCategory(previousPlayer.category);
        setShowLeaderboard(true);
        setCurrentCategory(currentPlayer.category);
      }
    }

    if (currentPlayerIndex >= players.length) {
      const lastPlayer = players[players.length - 1];
      if (lastPlayer) {
        setPreviousCategory(lastPlayer.category);
        setIsAuctionComplete(true);
        setShowLeaderboard(true);
      }
    }
  }, [currentPlayerIndex, players]);

  const getBidIncrement = (currentBid) => {
    // Convert to crores for easier comparison
    const bidInCrores = currentBid / 10000000;
    
    if (bidInCrores < 8) {
      return 2000000;  // 20 lakhs
    } else if (bidInCrores < 12) {
      return 2500000;  // 25 lakhs
    } else {
      return 5000000;  // 50 lakhs
    }
  };

  const handleBid = () => {
    if (currentBid === 0) {
      setCurrentBid(players[currentPlayerIndex].basePrice);
    } else {
      const increment = getBidIncrement(currentBid);
      setCurrentBid(prev => prev + increment);
    }
    setIsTimerRunning(true);
    setTimer(30);
  };

  const handleSold = () => {
    if (selectedTeam && currentBid > 0) {
      setTeams(prevTeams => prevTeams.map(team => 
        team.name === selectedTeam 
          ? {
              ...team,
              purse: team.purse - currentBid,
              players: [...team.players, { 
                ...players[currentPlayerIndex],
                soldFor: currentBid,
              }]
            }
          : team
      ));

      setAuctionHistory(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        player: players[currentPlayerIndex].name,
        team: selectedTeam,
        amount: currentBid,
        points: players[currentPlayerIndex].points
      }]);

      setCurrentPlayerIndex(prev => prev + 1);
      setCurrentBid(0);
      setSelectedTeam('');
      setIsTimerRunning(false);
      setTimer(30);
    }
  };

  const handleSkip = () => {
    setCurrentPlayerIndex(prev => prev + 1);
    setCurrentBid(0);
    setSelectedTeam('');
    setIsTimerRunning(false);
    setTimer(30);
  };

  const handleContinueAuction = () => {
    setShowLeaderboard(false);
  };

  const calculateTimeLeft = () => {
    const circumference = 2 * Math.PI * 28;
    const timeLeft = (timer / 30) * circumference;
    return circumference - timeLeft;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePlayerSelect = (player) => {
    const index = players.findIndex(p => p.id === player.id);
    setCurrentPlayerIndex(index);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  if (isAuctionComplete) {
    return (
      <div className="auction-complete">
        <h2>IPL Auction 2024 Complete!</h2>
        <Leaderboard teams={teams} isFinal={true} />
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <div className="category-complete">
        <h2>{previousCategory} Complete!</h2>
        <Leaderboard teams={teams} isFinal={false} />
        <button 
          className="continue-button"
          onClick={handleContinueAuction}
        >
          Continue to {currentCategory}
        </button>
      </div>
    );
  }

  const currentPlayer = filteredPlayers[currentPlayerIndex];

  if (!currentPlayer) {
    return <div className="error">No player data available</div>;
  }

  return (
    <div className="auction-container">
      <div className="main-content">
        <div className="auction-header">
          <h1 className="auction-title">IPL Auction 2024</h1>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search Player" 
              className="search-input"
              value={searchQuery}
              onChange={handleSearch}
            />
            {showSearchResults && searchQuery.trim() !== '' && (
              <div className="search-results">
                {filteredPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className="search-result-item"
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="player-search-name">{player.name}</div>
                    <div className="player-search-details">
                      <span>{player.role}</span>
                      <span>{player.category}</span>
                      <span>₹{(player.basePrice / 10000000).toFixed(2)} Cr</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="category-display">
          <div className="category-label">Category</div>
          <div className="category-name">
            {currentPlayer?.category || 'Marquee Players'}
          </div>
        </div>

        <div className="player-info">
          <div className="player-card">
            <h2 className="player-name">{currentPlayer?.name}</h2>
            <div className="player-essential-details">
              <div className="detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value">{currentPlayer?.role}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Base Price</span>
                <span className="detail-value">₹{(currentPlayer?.basePrice / 10000000).toFixed(2)} Cr</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Country</span>
                <span className="detail-value">{currentPlayer?.country}</span>
              </div>
            </div>

            {isTimerRunning && (
              <div className="timer-container">
                <svg width="60" height="60">
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    className="timer-circle"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={calculateTimeLeft()}
                  />
                </svg>
                <div className="timer-text">{timer}</div>
              </div>
            )}
          </div>

          <div className="bidding-section">
            <div className="current-bid">
              <h2>Current Bid</h2>
              <div className={`bid-amount ${isTimerRunning ? 'active' : ''}`}>
                ₹{(currentBid / 10000000).toFixed(2)} Cr
              </div>
            </div>

            <div className="bid-controls">
              <button 
                className={`bid-button ${isTimerRunning ? 'active' : ''}`}
                onClick={handleBid}
              >
                {currentBid === 0 ? 'Start Bidding' : `+${(getBidIncrement(currentBid) / 10000000).toFixed(2)} Cr`}
              </button>
            </div>

            <div className="team-selection">
              <select 
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="team-dropdown"
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
            </div>

            <div className="action-buttons">
              <button 
                className="sold-button"
                onClick={handleSold}
                disabled={!selectedTeam || currentBid === 0}
              >
                SOLD
              </button>
              <button 
                className="skip-button"
                onClick={handleSkip}
              >
                SKIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerAuction; 