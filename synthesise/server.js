const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static('public'));

// FILE-BASED LICENSE STORAGE
const LICENSE_FILE = path.join(__dirname, 'licenses.json');

let licenses = new Map();

// Save licenses to file
function saveLicenses() {
  try {
    const licensesObject = {};
    for (let [key, data] of licenses.entries()) {
      licensesObject[key] = {
        email: data.email,
        name: data.name,
        created: data.created.toISOString(),
        expiry: data.expiry.toISOString(),
        used: data.used
      };
    }
    fs.writeFileSync(LICENSE_FILE, JSON.stringify(licensesObject, null, 2));
  } catch (error) {
    console.error('Error saving licenses:', error);
  }
}

// Load licenses from file
function loadLicenses() {
  try {
    if (fs.existsSync(LICENSE_FILE)) {
      const data = fs.readFileSync(LICENSE_FILE, 'utf8');
      const licensesObject = JSON.parse(data);
      
      for (let [key, data] of Object.entries(licensesObject)) {
        licenses.set(key, {
          email: data.email,
          name: data.name,
          created: new Date(data.created),
          expiry: new Date(data.expiry),
          used: data.used
        });
      }
      console.log(`Loaded ${licenses.size} license keys from file`);
    } else {
      // Initialize with default test key
      licenses.set('DMS-FREE-TEST', {
        email: 'test@test.com',
        name: 'Test User',
        created: new Date(),
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        used: false
      });
      saveLicenses();
      console.log('Created new licenses.json with test key');
    }
  } catch (error) {
    console.error('Error loading licenses:', error);
    // Initialize with default test key on error
    licenses.set('DMS-FREE-TEST', {
      email: 'test@test.com',
      name: 'Test User',
      created: new Date(),
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      used: false
    });
  }
}

// Load licenses on startup
loadLicenses();

// MASTER KEY - Change this to whatever you want
const MASTER_KEY = 'DMS-MASTER-2024';

console.log('Digital Mindset AI - Synthesise Mode');
console.log('TEST KEY: DMS-FREE-TEST');

// SMART PROMPT - Different rules for niches vs chapters
const SYNTHESISE_PROMPT = `You are Synthesise Mode with two functions:

FUNCTION 1: NICHE DISCOVERY
- When asked for niches: Show 5 profitable digital product niches
- Format for niches: Simple numbered list "1. Niche description"
- Niches can use normal formatting like numbers and dashes

FUNCTION 2: BOOK CREATION  
- When creating chapters: Use strict plain text only
- NO markdown: no **bold**, no # headers, no symbols for formatting
- For chapters: Use "Chapter X: Title" then normal paragraphs
- For lists: "1. Item one" with regular text
- Professional language, no emojis

EXAMPLES:
NICHES FORMAT:
1. AI Content Creation Tools - Software for generating written and visual content
2. Digital Wellness Apps - Mobile apps for mental health and meditation

CHAPTER FORMAT:
Chapter 1: Understanding Market Fundamentals
This chapter covers essential concepts. We explore key areas.

First, market analysis provides the foundation. Understanding your audience is crucial.

KEY POINTS:
1. Identify customer needs through research
2. Analyze competitor offerings
3. Develop unique value propositions`;

// Check if key is master key
function isMasterKey(key) {
  return key === MASTER_KEY;
}

app.post('/validate-license', (req, res) => {
  const { license } = req.body;
  
  if (isMasterKey(license)) {
    return res.json({ valid: true, message: 'Master key accepted', isMaster: true });
  }
  
  const licenseData = licenses.get(license);
  if (!licenseData) return res.json({ valid: false, message: 'Invalid license' });
  
  // Check if license has expired
  if (new Date() > licenseData.expiry) {
    return res.json({ valid: false, message: 'License expired' });
  }
  
  res.json({ valid: true, message: 'License valid', isMaster: false });
});

app.post('/api/synthesise', async (req, res) => {
  try {
    const { userInput, license, action, currentChapter } = req.body;
    
    // Master key has full access
    if (!isMasterKey(license)) {
      const licenseData = licenses.get(license);
      if (!licenseData) return res.status(401).json({ error: 'Invalid license' });
      
      // Check if license has expired
      if (new Date() > licenseData.expiry) {
        return res.status(401).json({ error: 'License expired' });
      }
    }
    
    console.log('Making API call...');
    
    const temperature = (action === 'generate_chapter') ? 0.7 : 0.3;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: SYNTHESISE_PROMPT 
        },
        { role: "user", content: userInput }
      ],
      max_tokens: 2000,
      temperature: temperature
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('API call successful');
    
    let result = response.data.choices[0].message.content;
    
    if (action === 'generate_chapter') {
      result = result
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s?/g, '')
        .replace(/`(.*?)`/g, '$1');
    }
    
    res.json({ result: result });
    
  } catch (error) {
    console.log('=== API ERROR ===');
    console.log('Error details:', error.response?.data?.error || error.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

// === MASTER KEY ADMIN SYSTEM === //

// Generate license key
app.post('/admin/generate-key', (req, res) => {
  const key = 'DMS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (req.body.months || 1));
  
  licenses.set(key, {
    email: req.body.email || '',
    name: req.body.name || '',
    created: new Date(),
    expiry: expiry,
    used: false
  });
  
  saveLicenses();
  
  res.json({ 
    success: true,
    license: key,
    expiry: expiry.toDateString(),
    months: req.body.months || 1
  });
});

// Quick generate
app.get('/admin/quick-generate', (req, res) => {
  const key = 'DMS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);
  
  licenses.set(key, {
    email: '',
    name: '',
    created: new Date(),
    expiry: expiry,
    used: false
  });
  
  saveLicenses();
  
  res.json({ 
    license: key,
    expiry: expiry.toDateString()
  });
});

// View all keys
app.get('/admin/all-keys', (req, res) => {
  const allKeys = Array.from(licenses.entries()).map(([key, data]) => ({
    key: key,
    email: data.email,
    name: data.name,
    created: data.created.toDateString(),
    expiry: data.expiry.toDateString(),
    used: data.used,
    status: new Date() > data.expiry ? 'EXPIRED' : data.used ? 'USED' : 'ACTIVE'
  }));
  
  allKeys.sort((a, b) => new Date(b.created) - new Date(a.created));
  res.json(allKeys);
});

// Delete single key
app.post('/admin/delete-key', (req, res) => {
  const deleted = licenses.delete(req.body.key);
  if (deleted) {
    saveLicenses();
  }
  res.json({ success: deleted, message: deleted ? 'Key deleted' : 'Key not found' });
});

// Delete expired keys
app.get('/admin/delete-expired', (req, res) => {
  let deletedCount = 0;
  for (let [key, data] of licenses.entries()) {
    if (new Date() > data.expiry) {
      licenses.delete(key);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    saveLicenses();
  }
  res.json({ success: true, deleted: deletedCount });
});

// Delete ALL keys
app.get('/admin/delete-all', (req, res) => {
  const keyCount = licenses.size;
  licenses.clear();
  saveLicenses();
  res.json({ success: true, deleted: keyCount, message: 'All keys deleted' });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel (Vercel handles this automatically)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Server ready - Access at http://0.0.0.0:' + PORT);
  });
}

// Export for Vercel serverless deployment
module.exports = app;