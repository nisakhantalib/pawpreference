import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const App = () => {
  // State management for the application
  // cats: array holding all the cat data fetched from API
  // likedCats: stores cats that user swiped right on
  // dislikedCats: stores cats that user swiped left on
  // showSummary: boolean to toggle between main swipe view and results summary
  const [cats, setCats] = useState([]);
  const [likedCats, setLikedCats] = useState([]);
  const [dislikedCats, setDislikedCats] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  // Effect hook to load cat data when component first mounts
  // This runs only once on initial render (empty dependency array)
  useEffect(() => {
    // Only load cats if the array is empty (prevents reloading when returning to tab)
    if (cats.length === 0 && !showSummary) {
      async function loadCats() {
        // Create an array of 10 fetch promises to get cat data from API
        // Using Array.from to generate multiple async requests simultaneously
        const promises = Array.from({ length: 10 }, async () => {
          const res = await fetch("https://cataas.com/cat?json=true");
          return res.json();
        });
        
        // Wait for all API calls to complete before proceeding
        const results = await Promise.all(promises);
        
        // Preload all images to prevent lag during swiping
        // This creates an Image object for each cat and waits for it to load
        // before displaying any cards to the user
        await Promise.all(results.map(cat => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;   // Resolve promise when image successfully loads
            img.onerror = resolve;  // Also resolve on error so one failed image doesn't block everything
            img.src = `https://cataas.com/cat/${cat.id}`;
          });
        }));
        
        // Only set cats state after all images are preloaded
        // This ensures smooth experience with no loading delays
        setCats(results);
      }
      loadCats();
    }
  }, [cats.length, showSummary]);

  // Handler function called when user swipes a card off screen
  // id: unique identifier of the cat being swiped
  // direction: positive value means swipe right (like), negative means swipe left (dislike)
  const handleCardRemove = (id, direction) => {
    // Find the cat object that matches the swiped card
    const cat = cats.find(c => c.id === id);
    
    // Add cat to appropriate array based on swipe direction
    if (direction > 0) {
      // Right swipe = like
      setLikedCats([...likedCats, cat]);
    } else {
      // Left swipe = dislike
      setDislikedCats([...dislikedCats, cat]);
    }

    // Update cats array by removing the swiped cat
    setCats(prev => {
      const remaining = prev.filter(c => c.id !== id);
      
      // If no cats left, show the summary screen
      if (remaining.length === 0) {
        setShowSummary(true);
      }
      
      return remaining;
    });
  };

  // Conditional rendering: if user finished swiping, show summary screen
  if (showSummary) {
    return (
      <Summary 
        likedCats={likedCats} 
        dislikedCats={dislikedCats} 
        onRestart={() => {
          // Reset all state back to initial values
          setShowSummary(false);
          setLikedCats([]);
          setDislikedCats([]);
          
          // Fetch new batch of cats to start over
          async function loadCats() {
            const promises = Array.from({ length: 10 }, async () => {
              const res = await fetch("https://cataas.com/cat?json=true");
              return res.json();
            });
            const results = await Promise.all(promises);
            setCats(results);
          }
          loadCats();
        }} 
      />
    );
  }

  // Main swiping interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex flex-col items-center justify-center p-4">
      {/* Header section with title and instructions */}
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2">
          🐾 Paws Preferences
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Swipe right to like, left to pass
        </p>
        {/* Display counter showing how many cats are left */}
        <p className="text-xs md:text-sm text-gray-500 mt-2">
          {cats.length} cats remaining
        </p>
      </div>

      {/* Card container with fixed height to prevent layout shift */}
      <div className="relative w-full max-w-sm mx-auto" style={{ height: '420px' }}>
        {/* Background decoration with subtle grid pattern */}
        <div 
          className="absolute inset-0 bg-white/50 rounded-3xl shadow-2xl"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='%23e5e5e5'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")` 
          }} 
        />
        
        {/* Centered loading state */}
        {cats.length === 0 && !showSummary && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-lg ">Loading adorable cats...</p>
          </div>
        )}

        {/* Card stack container with fixed dimensions */}
        <div className="relative h-full flex items-center justify-center">
          <div className="relative" style={{ width: '280px', height: '380px' }}>
            {/* Render all cat cards - only top card will be visible due to Card logic */}
            {cats.map((cat) => (
              <Card
                key={cat.id}
                cat={cat}
                cards={cats}
                onRemove={handleCardRemove}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons: now clickable and synced with swipe */}
      <div className="flex gap-6 mt-6">
        {/* Dislike button */}
        <button
          onClick={() => {
            if (cats.length > 0) handleCardRemove(cats[cats.length - 1].id, -100);
          }}
          disabled={cats.length === 0}
          className={`flex flex-col items-center ${
            cats.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl shadow-lg">
            ✕
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">Pass</p>
        </button>

        {/* Like button */}
        <button
          onClick={() => {
            if (cats.length > 0) handleCardRemove(cats[cats.length - 1].id, 100);
          }}
          disabled={cats.length === 0}
          className={`flex flex-col items-center ${
            cats.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl shadow-lg">
            ♥
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">Like</p>
        </button>
      </div>
    </div>
  );
};

// Individual card component that handles drag interactions
// Props: cat (data object), cards (full array), onRemove (callback function)
const Card = ({ cat, cards, onRemove }) => {
  // Motion values for smooth drag animations
  // x tracks horizontal position during drag
  const x = useMotionValue(0);
  
  // Transform x position into rotation angle
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  
  // Transform x position into opacity for fade effect
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  // Only render the top card in the stack
  const isFront = cat.id === cards[cards.length - 1].id;

  // Called when user stops dragging the card
  const handleDragEnd = () => {
    const xValue = x.get();
    if (Math.abs(xValue) > 50) {
      onRemove(cat.id, xValue);
    }
  };

  if (!isFront) return null;

  // Animated image card with drag functionality
  return (
    <motion.img
      src={`https://cataas.com/cat/${cat.id}`}
      alt="Cat"
      className="absolute top-0 left-0 rounded-2xl bg-white object-cover cursor-grab active:cursor-grabbing"
      style={{
        width: '280px',
        height: '380px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
        x, // Bind horizontal position
        opacity, // Bind opacity transform
        rotate, // Bind rotation transform
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      drag="x"
      dragConstraints={false}
      onDragEnd={handleDragEnd}
    />
  );
};

// Summary screen component showing results after all cats have been swiped
// Props: likedCats array, dislikedCats array, onRestart callback
const Summary = ({ likedCats, dislikedCats, onRestart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        {/* Main heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          🎉 Your Cat Preferences
        </h1>
        
        {/* Statistics grid showing like/dislike counts */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-center">
          <div className="bg-green-100 rounded-xl p-4 md:p-6">
            <div className="text-4xl md:text-5xl mb-2">♥</div>
            <p className="text-2xl md:text-3xl font-bold text-green-700">
              {likedCats.length}
            </p>
            <p className="text-sm md:text-base text-gray-600">Cats Liked</p>
          </div>
          
          <div className="bg-red-100 rounded-xl p-4 md:p-6">
            <div className="text-4xl md:text-5xl mb-2">✕</div>
            <p className="text-2xl md:text-3xl font-bold text-red-700">
              {dislikedCats.length}
            </p>
            <p className="text-sm md:text-base text-gray-600">Cats Passed</p>
          </div>
        </div>

        {/* Gallery of liked cats */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-500">♥</span> Your Favorite Cats
          </h2>
          
          {likedCats.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {likedCats.map((cat) => (
                <div key={cat.id} className="aspect-square overflow-hidden rounded-lg shadow-md">
                  <img
                    src={`https://cataas.com/cat/${cat.id}`}
                    alt="Liked cat"
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No cats liked yet</p>
          )}
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 md:py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg text-sm md:text-base"
        >
          🔄 Start Over
        </button>
      </div>
    </div>
  );
};

export default App;
