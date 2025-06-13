import React from 'react';
import '../styles/Background.css';

const Background = ({ children }) => {

    return (
        <div className="background-container">
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Background;