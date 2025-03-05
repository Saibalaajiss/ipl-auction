import React, { useState } from 'react';
import PlayerAuction from './components/PlayerAuction';
import CategorySelector from './components/CategorySelector';
import TeamStats from './components/TeamStats';
import './App.css';

function App() {
    const categories = [
        'Marquee Players',
        'Foreign Players',
        'Indian Players'
    ];

    const [currentCategory, setCurrentCategory] = useState(categories[0]);
    const [showStats, setShowStats] = useState(false);
    const [auctionComplete, setAuctionComplete] = useState(false);
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

    const handleCategoryComplete = () => {
        const nextCategoryIndex = categories.indexOf(currentCategory) + 1;
        if (nextCategoryIndex < categories.length) {
            setCurrentCategory(categories[nextCategoryIndex]);
        } else {
            setAuctionComplete(true);
        }
    };

    if (auctionComplete) {
        return (
            <div className="auction-complete">
                <h1>IPL Auction Complete!</h1>
                <TeamStats teams={teams} isFullScreen={true} />
            </div>
        );
    }

    return (
        <div className="app">
            <button 
                className="stats-toggle"
                onClick={() => setShowStats(!showStats)}
            >
                {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>

            {showStats && <TeamStats teams={teams} />}

            <div className="main-container">
                <CategorySelector
                    categories={categories}
                    currentCategory={currentCategory}
                    onCategorySelect={setCurrentCategory}
                />

                <PlayerAuction
                    teams={teams}
                    setTeams={setTeams}
                    currentCategory={currentCategory}
                    onCategoryComplete={handleCategoryComplete}
                />
            </div>
        </div>
    );
}

export default App; 