# Paws Preferences

An interactive web application that allows users to browse random cat photos through a swipe-based interface. Built with React and designed with a focus on smooth user interactions.

## Overview

This application presents users with 10 random cat photos that can be swiped right to like or left to pass. Upon completion, users can view their preferences and optionally restart with a new set of images.

## Live Demo

The application is deployed at: https://nisakhantalib.github.io/pawpreference

## Features

- Swipe-based card interface with drag gestures
- Alternative button controls for like/pass actions
- Image preloading to ensure smooth transitions
- Animated card movements and transitions
- Summary view displaying user preferences and statistics
- Responsive design for mobile and desktop devices
- Integration with Cat as a Service API for random cat images

## Installation

To run this project locally:

```bash
git clone https://github.com/nisakhantalib/pawpreference.git
cd pawpreference
npm install
npm start
```

The application will be available at http://localhost:3000

## Technologies

- **React 18.2.0** - JavaScript library for building user interfaces
- **Framer Motion 10.16.4** - Animation library for gesture-based interactions
- **Tailwind CSS** - Utility-first CSS framework
- **Cat as a Service API** - External API providing random cat images

## Implementation Details

The application uses Framer Motion's motion values to track horizontal drag position and transform it into rotation and opacity changes. Cards are removed when dragged beyond a 50-pixel threshold in either direction.

To optimize performance, all images are preloaded before rendering the card stack. This prevents loading delays during the swipe interaction and ensures a fluid user experience.

Both swipe gestures and button clicks trigger the same removal handler, maintaining consistency between interaction methods.

## Project Structure

```
src/
  App.js          Main application component with state management
  index.js        Application entry point
  index.css       Global stylesheet
```

The application architecture centers around a single main component that manages state for the cat array, user preferences, and view transitions. Child components handle card interactions and results display.

## Deployment

This project is configured for deployment to GitHub Pages:

1. Update the `homepage` field in package.json with GitHub Pages URL
2. Run `npm run deploy` to build and deploy

The deployment process uses the gh-pages package to automatically push the build output to the gh-pages branch.

## API Reference

Cat images are retrieved from https://cataas.com using their JSON endpoint:
```
GET https://cataas.com/cat?json=true
```

## Future Enhancements

Potential improvements for future versions:
- Configurable number of cats per session
- Local storage integration for persistent favorites
- Category filtering for cat types
- Keyboard navigation support
- Undo functionality for accidental swipes

## Acknowledgments

- Cat as a Service (cataas.com) for providing the image API
- Framer Motion library for animation capabilities

