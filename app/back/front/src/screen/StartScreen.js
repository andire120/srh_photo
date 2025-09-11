import React from "react";
import "./StartScreen.css"; // Importing CSS for styles

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <div className="h-container">
        <div className="height">
          <div className="left-container">
            <img src={`${process.env.PUBLIC_URL}/spamlogo.png`} alt="Spam Logo" className="logo" />
            <p className="jum">●</p>
          </div>
          <div className="right-container">
            <img src={`${process.env.PUBLIC_URL}/spamlogo2.png`} alt="Spam Logo Ver2" className="logo2" />
            <div className="text-group">
              <h2 className="big">Self Photo Booth</h2><h4 className="smail">of SRH</h4>
            </div>   
          </div>
      </div>
      
      </div>
      
      <button className="start-button" onClick={onStart}>Start</button>
    </div>
  );
};

export default StartScreen;