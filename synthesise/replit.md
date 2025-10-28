# Digital Mindset AI - Synthesise Mode

## Overview
This is an AI-powered digital product research and content generation tool. The application uses OpenAI's API to help users discover profitable digital product niches and generate book chapters for those niches.

## Project Architecture
- **Frontend**: Static HTML/CSS/JavaScript served from the `public/` directory
- **Backend**: Express.js server handling API requests and license management
- **AI Integration**: OpenAI API for content generation
- **License Storage**: Persistent file-based system using licenses.json

## Key Features
1. Persistent license key management system with file-based storage
2. Time-based license expiry (1-month, 3-month, 6-month, or 1-year keys)
3. Market niche discovery using AI
4. Automated book chapter generation
5. Admin panel for license key management (accessible with master key)

## Configuration
- Server runs on port 5000 (required for Replit environment)
- Requires OPENAI_API_KEY environment variable
- Default test license key: `DMS-FREE-TEST`
- Default master key: `DMS-MASTER-2024`

## Project Structure
```
/
├── server.js          # Express backend server
├── licenses.json      # Persistent license key storage (not in git)
├── vercel.json        # Vercel deployment configuration
├── .vercelignore      # Files to exclude from Vercel deployment
├── public/            # Static frontend files
│   ├── index.html     # Main HTML interface
│   ├── style.css      # Styling
│   └── app.js         # Frontend JavaScript
├── package.json       # Node.js dependencies
└── .env              # Environment variables (not in git)
```

## Deployment

### Vercel Deployment
This application is configured for deployment on Vercel:

1. **Prerequisites:**
   - Push your code to GitHub, GitLab, or Bitbucket
   - Create a Vercel account at https://vercel.com

2. **Deploy Steps:**
   - Import your repository in Vercel dashboard
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy (Vercel will auto-detect Node.js and use vercel.json config)

3. **Important Notes:**
   - **CRITICAL:** The file-based license storage (licenses.json) will NOT work on Vercel
   - Vercel serverless functions have read-only filesystems - license writes will fail
   - For production Vercel deployment, you MUST switch to a database:
     - Option 1: Vercel Postgres (recommended)
     - Option 2: MongoDB Atlas
     - Option 3: Redis/KV store
   - Until database integration is added, use Replit deployment for license management
   - The app is configured to work on both platforms (detects Vercel environment)

### Replit Deployment
- Use the built-in Replit deployment feature
- Server is already configured to run on port 5000
- All environment variables are managed through Replit Secrets

## Recent Changes
- October 28, 2025: Added Vercel deployment configuration
  - Created vercel.json for serverless deployment
  - Modified server.js to export app for Vercel
  - Added .vercelignore to exclude development files
  - Server now detects Vercel environment automatically

- October 28, 2025: Implemented persistent file-based license system
  - License keys now saved to licenses.json file
  - Keys persist across server restarts
  - Automatic expiry checking on validation and API calls
  - 1-month keys expire after 1 month, 3-month after 3 months, etc.
  - Delete operations remove keys from file
  - Error handling for file operations
  - Added licenses.json to .gitignore
  
- October 28, 2025: Imported from GitHub and configured for Replit environment
  - Moved static files to public/ directory
  - Configured server to listen on 0.0.0.0:5000
  - Added cache control headers
  - Converted line endings to Unix format
  - Set up OpenAI integration using Replit Secrets
  - Installed Node.js 20 and all npm dependencies
  - Created .gitignore for Node.js projects
  - Configured workflow to run server on port 5000
  - Set up autoscale deployment configuration
  - Security enhancement: Removed MASTER_KEY from console logs
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
