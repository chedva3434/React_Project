import React, { useState, useEffect } from 'react';
import Footer1 from './footer';
import AuthModal from './test';

const Home = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const fullText = "ברוכים הבאים לאתר המתכונים."; // הטקסט המלא
  const colors = ['#9c27b0', '#c96b38', '#FF9900', '#FFC107'];
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(prev => prev + fullText[index]);
        setIndex(prev => prev + 1);
        setColorIndex(prev => (prev + 1) % colors.length);
      } else {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval); 
  }, [index, fullText, colors]);

  return (
    <>
    <AuthModal/>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100vh',
        fontSize: '50px',
        color: colors[colorIndex],
        whiteSpace: 'pre-line',
        direction: 'rtl',
        marginLeft: '1',
      }}
    >
      <h1>{displayedText}</h1>
    </div>
    <Footer1/>
    </>
  );
};

export default Home;
