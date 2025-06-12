import React from "react";
import "./TutorialScreen.css";

const TutorialScreen = ({ onComplete }) => {
    return(
        <>
        <h1 className="head">HOW TO USE</h1>
    <div class="container">
        
    <div class="left">
        <img src="/example.png" alt="example" />    
    </div>
    <div class="no-center">
    <ul><li>Please choose a frame that you like &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;before shooting.<br/><br/></li>
        <li>Four photos are taken every five &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seconds. Pose in time!<br/><br/></li>
        <li>Print or download the completed &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;spam four-cut, Keep it.</li>
    </ul>
    </div>
    </div>
            <button className="next-button" onClick={ onComplete }>Go to select frame</button> 
        </> 
    )
}



export default TutorialScreen;