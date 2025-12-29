import React, { useState, useEffect } from "react";

function NetflixLoader({ isLoading, onLoaded }) {
  const [currentLang, setCurrentLang] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const greetings = [
    "Hello Welcome",
    "Hola Bienvenido",
    "Bonjour Bienvenue",
    "Namaste Swagat Hai",
  ];

  useEffect(() => {
    // When used as a fallback, isLoading is undefined.
    // We only want the animation to run on initial load.
    if (isLoading === undefined) {
      return;
    }
    if (cycleCount >= greetings.length) {
      // Trigger zoom effect and redirect
      setIsZooming(true);
      setTimeout(() => {
        if (onLoaded) onLoaded(); // Signal that loading is complete
      }, 1500); // delay for zoom animation
      return;
    }

    const currentGreeting = greetings[currentLang];
    let charIndex = 0;

    if (isTyping) {
      const typeInterval = setInterval(() => {
        if (charIndex <= currentGreeting.length) {
          setDisplayText(currentGreeting.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setIsTyping(false), 1000);
        }
      }, 80);

      return () => clearInterval(typeInterval);
    } else {
      const eraseInterval = setInterval(() => {
        if (charIndex < currentGreeting.length) {
          setDisplayText(
            currentGreeting.slice(0, currentGreeting.length - charIndex)
          );
          charIndex++;
        } else {
          clearInterval(eraseInterval);
          setIsTyping(true);
          setCurrentLang((prev) => (prev + 1) % greetings.length);
          setCycleCount((prev) => prev + 1);
        }
      }, 40);

      return () => clearInterval(eraseInterval);
    }
  }, [currentLang, isTyping, cycleCount, onLoaded, greetings.length, isLoading]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Main content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-[1500ms] ${
          isZooming ? "scale-[20] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Typewriter text */}
        <div className="text-center min-h-32 flex items-center justify-center px-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            {displayText}
            <span className="animate-pulse">|</span>
          </h1>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-in;
        }
      `}</style>
    </div>
  );
}

export default React.memo(NetflixLoader);

