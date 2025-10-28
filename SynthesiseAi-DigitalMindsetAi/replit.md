# Digital Mindset AI - Synthesise Mode

## Overview
This is an AI-powered digital product research and content generation tool. The application uses OpenAI's API to help users discover profitable digital product niches and generate book chapters for those niches.

## Project Architecture
- **Frontend**: Static HTML/CSS/JavaScript served from the `public/` directory
- **Backend**: Express.js server handling API requests and license management
- **AI Integration**: OpenAI API for content generation

## Key Features
1. License key management system
2. Market niche discovery using AI
3. Automated book chapter generation
4. Admin panel for license key management (accessible with master key)

## Configuration
- Server runs on port 5000 (required for Replit environment)
- Requires OPENAI_API_KEY environment variable
- Default test license key: `DMS-FREE-TEST`
- Default master key: `DMS-MASTER-2024`

## Project Structure
```
/
├── server.js          # Express backend server
├── public/            # Static frontend files
│   ├── index.html     # Main HTML interface
│   ├── style.css      # Styling
│   └── app.js         # Frontend JavaScript
├── package.json       # Node.js dependencies
└── .env              # Environment variables (not in git)
```

## Recent Changes
- October 27, 2025: Imported from GitHub and configured for Replit environment
  - Moved static files to public/ directory
  - Configured server to listen on 0.0.0.0:5000
  - Added cache control headers
  - Converted line endings to Unix format
  - Set up OpenAI integration
  - Added confirmation buttons to prevent automatic AI API calls:
    * "Generate Niches" button appears after license activation (no auto-generation)
    * "Create E-book" button required after niche selection or custom topic entry
    * "Generate Next Chapter" button required for each chapter (no auto-generation)
    * All API calls now require explicit user confirmation via button clicks
  - Complete design overhaul for professional appearance:
    * Modern color scheme: Deep navy background (#0A0E1A) with indigo/purple accents
    * Professional typography: Inter for body text, Space Grotesk for headings
    * Gradient effects on primary buttons and title logo
    * Improved spacing, border radius, and hover effects
    * Custom scrollbar styling
    * Removed all emojis from UI and server logs
    * Enhanced card designs with subtle shadows and hover states
    * Responsive design optimizations

## User Preferences
Not yet configured.
