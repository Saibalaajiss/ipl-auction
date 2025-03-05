import React from 'react';
import './CategorySelector.css';

const CategorySelector = ({ categories, currentCategory, onCategorySelect }) => {
    return (
        <div className="category-selector">
            {categories.map(category => (
                <button
                    key={category}
                    className={`category-button ${currentCategory === category ? 'active' : ''}`}
                    onClick={() => onCategorySelect(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategorySelector; 