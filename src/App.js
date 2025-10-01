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
  }, []); // Empty array means this only runs once when component mounts

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
        
        {/* Loading message displayed while fetching cats - centered in the background container */}
        {cats.length === 0 && !showSummary && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-lg animate-pulse">Loading adorable cats...</p>
          </div>
        )}
        
        <div className="relative h-full flex items-center justify-center">
          {/* Card stack container with fixed dimensions */}
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

      {/* Legend showing swipe actions */}
      <div className="flex gap-8 mt-6">
        {/* Dislike button */}
        <button
          onClick={() => {
            if (cats.length > 0) {
              const frontCat = cats[cats.length - 1];
              handleCardRemove(frontCat.id, -100); // negative = pass
            }
          }}
          disabled={cats.length === 0}
          className="flex flex-col items-center gap-2 disabled:opacity-50"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl shadow-lg hover:bg-red-600 active:scale-90 transition-all">
            ✕
          </div>
          <p className="text-xs md:text-sm text-gray-600">Pass</p>
        </button>

        {/* Like button */}
        <button
          onClick={() => {
            if (cats.length > 0) {
              const frontCat = cats[cats.length - 1];
              handleCardRemove(frontCat.id, 100); // positive = like
            }
          }}
          disabled={cats.length === 0}
          className="flex flex-col items-center gap-2 disabled:opacity-50"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl shadow-lg hover:bg-green-600 active:scale-90 transition-all">
            ♥
          </div>
          <p className="text-xs md:text-sm text-gray-600">Like</p>
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
  // When dragged left (-150px) card rotates -18deg, right (+150px) rotates +18deg
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  
  // Transform x position into opacity for fade effect
  // Card fades out as it's dragged away from center
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  // Only render the top card in the stack
  // Cards are rendered in order, but only last one should be visible and interactive
  const isFront = cat.id === cards[cards.length - 1].id;

  // Called when user stops dragging the card
  const handleDragEnd = () => {
    const xValue = x.get();
    
    // If dragged more than 50px in either direction, remove the card
    // Positive value = liked, negative = disliked
    if (Math.abs(xValue) > 50) {
      onRemove(cat.id, xValue);
    }
    // If dragged less than 50px, card will snap back to center (handled by framer-motion)
  };

  // Don't render cards that aren't on top
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
        transition: '0.125s transform' // Smooth spring-back animation
      }}
      // Initial animation when card appears
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      // Enable horizontal dragging only
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
          
          {/* Disliked cats counter */}
          <div className="bg-red-100 rounded-xl p-4 md:p-6">
            <div className="text-4xl md:text-5xl mb-2">✕</div>
            <p className="text-2xl md:text-3xl font-bold text-red-700">
              {dislikedCats.length}
            </p>
            <p className="text-sm md:text-base text-gray-600">Cats Passed</p>
          </div>
        

        
          {/* Liked cats counter */}
          <div className="bg-green-100 rounded-xl p-4 md:p-6">
            <div className="text-4xl md:text-5xl mb-2">♥</div>
            <p className="text-2xl md:text-3xl font-bold text-green-700">
              {likedCats.length}
            </p>
            <p className="text-sm md:text-base text-gray-600">Cats Liked</p>
          </div>
         </div> 

        {/* Gallery of liked cats */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-500">♥</span> Your Favorite Cats
          </h2>
          
          {/* Conditional rendering based on whether user liked any cats */}
          {likedCats.length > 0 ? (
            // Grid layout displaying all liked cat images
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
            // Empty state message if no cats were liked
            <p className="text-gray-500 text-center py-8">No cats liked yet</p>
          )}
        </div>

        {/* Restart button to begin new session */}
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