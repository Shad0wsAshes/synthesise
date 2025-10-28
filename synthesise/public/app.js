let currentLicense = '';
let currentProject = null;

async function validateLicense() {
    const licenseKey = document.getElementById('licenseKey').value.trim();
    const statusDiv = document.getElementById('licenseStatus');
    
    if (!licenseKey) {
        statusDiv.innerHTML = '<div class="status-error">Please enter a license key</div>';
        return;
    }
    
    statusDiv.innerHTML = '<div class="status-info">Validating license...</div>';
    
    try {
        const response = await fetch('/validate-license', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ license: licenseKey })
        });
        
        const result = await response.json();
        
        if (result.valid) {
            currentLicense = licenseKey;
            
            if (result.isMaster) {
                showAdminPanel();
            } else {
                statusDiv.innerHTML = '<div class="status-success">Synthesise Mode activated</div>';
                document.getElementById('licenseSection').style.display = 'none';
                document.getElementById('synthesiseInterface').style.display = 'block';
            }
        } else {
            statusDiv.innerHTML = `<div class="status-error">${result.message}</div>`;
        }
    } catch (error) {
        statusDiv.innerHTML = '<div class="status-error">Network error. Please try again.</div>';
    }
}

function showAdminPanel() {
    document.body.innerHTML = `
        <div class="app-container">
            <header class="header">
                <div class="header-content">
                    <h1 class="logo">Digital Mindset AI</h1>
                    <p class="tagline">Admin Panel - License Management</p>
                </div>
            </header>

            <main class="main-content">
                <div class="card">
                    <h2>License Key Manager</h2>
                    <p>Master Key Active - Full Control</p>
                    
                    <div class="input-group">
                        <input type="email" id="adminEmail" placeholder="Customer email (optional)" class="text-input">
                        <input type="text" id="adminName" placeholder="Customer name (optional)" class="text-input">
                    </div>
                    
                    <div class="action-buttons">
                        <button onclick="generateKey(1)" class="btn-primary">Generate 1-Month Key</button>
                        <button onclick="generateKey(3)" class="btn-primary">Generate 3-Month Key</button>
                        <button onclick="generateKey(6)" class="btn-primary">Generate 6-Month Key</button>
                        <button onclick="generateKey(12)" class="btn-primary">Generate 1-Year Key</button>
                    </div>
                    
                    <div id="adminNewKey"></div>
                </div>

                <div class="card">
                    <h3>All License Keys</h3>
                    <button onclick="loadAllKeys()" class="btn-secondary">Refresh Key List</button>
                    <button onclick="deleteExpiredKeys()" class="btn-danger">Delete Expired Keys</button>
                    <div id="adminKeyList"></div>
                </div>
                
                <div class="action-buttons">
                    <button onclick="location.reload()" class="btn-secondary">Back to Main App</button>
                </div>
            </main>
        </div>
    `;
    
    // Add admin functions
    window.generateKey = async function(months) {
        const email = document.getElementById('adminEmail').value;
        const name = document.getElementById('adminName').value;
        
        const response = await fetch('/admin/generate-key', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email, name: name, months: months})
        });
        const data = await response.json();
        
        document.getElementById('adminNewKey').innerHTML = 
            `<div class="status-success">
                <strong>NEW KEY GENERATED:</strong><br>
                Key: ${data.license}<br>
                Expires: ${data.expiry} (${months} month${months > 1 ? 's' : ''})
            </div>`;
    };
    
    window.loadAllKeys = async function() {
        const response = await fetch('/admin/all-keys');
        const keys = await response.json();
        
        let html = `<h4>Total Keys: ${keys.length}</h4>`;
        keys.forEach(key => {
            const statusClass = key.status === 'ACTIVE' ? 'status-success' : 
                              key.status === 'USED' ? 'status-info' : 'status-error';
            html += `
                <div class="key-item" style="background: rgba(255,255,255,0.05); padding: 10px; margin: 5px 0; border-radius: 5px;">
                    <strong>${key.key}</strong><br>
                    Email: ${key.email || 'N/A'} | 
                    Created: ${key.created} | 
                    Expires: ${key.expiry} | 
                    Status: <span class="${statusClass}">${key.status}</span>
                    <button onclick="deleteKey('${key.key}')" style="background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 10px;">Delete</button>
                </div>
            `;
        });
        document.getElementById('adminKeyList').innerHTML = html;
    };
    
    window.deleteKey = async function(key) {
        if(confirm(`Delete key: ${key}?`)) {
            await fetch('/admin/delete-key', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({key: key})
            });
            loadAllKeys();
        }
    };
    
    window.deleteExpiredKeys = async function() {
        if(confirm('Delete ALL expired keys?')) {
            await fetch('/admin/delete-expired');
            loadAllKeys();
        }
    };
    
    loadAllKeys();
}

async function initializeAnalysis() {
    const nicheResults = document.getElementById('nicheResults');
    nicheResults.innerHTML = '<div class="status-info">Analyzing market opportunities...</div>';
    
    document.getElementById('analysisButtons').style.display = 'none';
    
    try {
        const response = await fetch('/api/synthesise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userInput: 'Show me 5 profitable digital product niches with high demand and low competition. Present them as a numbered list.',
                license: currentLicense
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            nicheResults.innerHTML = `<div class="status-error">${result.error}</div>`;
            document.getElementById('analysisButtons').style.display = 'flex';
        } else {
            displayNicheResults(result.result);
            document.getElementById('regenerateButtons').style.display = 'flex';
        }
    } catch (error) {
        nicheResults.innerHTML = '<div class="status-error">Failed to connect to server.</div>';
        document.getElementById('analysisButtons').style.display = 'flex';
    }
}

function displayNicheResults(content) {
    const nicheResults = document.getElementById('nicheResults');
    
    const lines = content.split('\n');
    const niches = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.match(/^[1-5]\.\s+/)) {
            const nicheText = line.replace(/^[1-5]\.\s+/, '').trim();
            if (nicheText && nicheText.length > 10) {
                niches.push(nicheText);
            }
        }
        
        if (niches.length >= 5) break;
    }
    
    if (niches.length > 0) {
        let nichesHtml = '';
        niches.forEach((niche, index) => {
            nichesHtml += `
                <div class="niche-item" onclick="selectNiche(${index})">
                    <span class="niche-number">${index + 1}</span>
                    <div class="niche-title">Opportunity ${index + 1}</div>
                    <div class="niche-description">${niche}</div>
                </div>
            `;
        });
        
        nicheResults.innerHTML = nichesHtml;
    } else {
        nicheResults.innerHTML = '<div class="status-info">Analysis complete. Please use custom topic option.</div>';
    }
}

let selectedNicheTopic = null;

function selectNiche(index) {
    document.querySelectorAll('.niche-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    selectedNicheTopic = event.currentTarget.querySelector('.niche-description').textContent;
    document.getElementById('confirmNicheBtn').style.display = 'block';
}

function regenerateAnalysis() {
    selectedNicheTopic = null;
    document.getElementById('confirmNicheBtn').style.display = 'none';
    document.getElementById('regenerateButtons').style.display = 'none';
    document.getElementById('analysisButtons').style.display = 'flex';
    document.getElementById('nicheResults').innerHTML = '';
}

function confirmNicheSelection() {
    if (selectedNicheTopic) {
        startContentGeneration(selectedNicheTopic);
    }
}

function showCustomTopic() {
    document.getElementById('analysisStep').style.display = 'none';
    document.getElementById('customTopicStep').style.display = 'block';
}

function backToAnalysis() {
    document.getElementById('customTopicStep').style.display = 'none';
    document.getElementById('analysisStep').style.display = 'block';
}

function confirmCustomTopic() {
    const customTopic = document.getElementById('customTopicInput').value.trim();
    if (!customTopic) {
        alert('Please enter a topic description');
        return;
    }
    
    startContentGeneration(customTopic);
}

function startContentGeneration(topic) {
    document.getElementById('analysisStep').style.display = 'none';
    document.getElementById('customTopicStep').style.display = 'none';
    document.getElementById('contentStep').style.display = 'block';
    
    currentProject = {
        topic: topic,
        currentChapter: 0,
        totalChapters: 10,
        chapters: []
    };
    
    updateProgress();
    
    const contentOutput = document.getElementById('contentOutput');
    contentOutput.innerHTML = '<div class="status-info">Ready to generate chapter content. Click "Generate Next Chapter" to begin.</div>';
    document.getElementById('contentActions').style.display = 'flex';
}

function updateProgress() {
    const progressContainer = document.getElementById('progressContainer');
    const steps = [
        'Chapter 1: Foundation',
        'Chapter 2: Core Concepts',
        'Chapter 3: Implementation',
        'Chapter 4: Advanced Techniques',
        'Chapter 5: Case Studies',
        'Chapter 6: Tools & Resources',
        'Chapter 7: Scaling',
        'Chapter 8: Troubleshooting',
        'Chapter 9: Future Trends',
        'Chapter 10: Conclusion'
    ];
    
    let progressHtml = '<h4>Book Generation Progress</h4>';
    steps.forEach((step, index) => {
        let status = 'pending';
        if (index < currentProject.currentChapter) status = 'completed';
        if (index === currentProject.currentChapter) status = 'active';
        
        progressHtml += `
            <div class="progress-step ${status}">
                <div class="step-indicator">${index + 1}</div>
                <div>${step}</div>
            </div>
        `;
    });
    
    progressContainer.innerHTML = progressHtml;
}

async function generateNextChapter() {
    const contentOutput = document.getElementById('contentOutput');
    const contentActions = document.getElementById('contentActions');
    
    contentActions.style.display = 'none';
    contentOutput.innerHTML = '<div class="status-info">Generating chapter content...</div>';
    
    let userPrompt = '';
    if (currentProject.currentChapter === 0) {
        userPrompt = `Create Chapter 1 for a digital product about: ${currentProject.topic}. Focus on foundational concepts and provide actionable, practical content.`;
    } else {
        userPrompt = `Continue with Chapter ${currentProject.currentChapter + 1} for: ${currentProject.topic}. Build logically from previous content and maintain practical focus.`;
    }
    
    try {
        const response = await fetch('/api/synthesise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userInput: userPrompt,
                license: currentLicense,
                action: 'generate_chapter',
                currentChapter: currentProject.currentChapter
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            contentOutput.innerHTML = `<div class="status-error">${result.error}</div>`;
        } else {
            contentOutput.innerHTML = `<div class="content-output">${result.result}</div>`;
            currentProject.currentChapter++;
            currentProject.chapters.push(result.result);
            updateProgress();
            
            if (currentProject.currentChapter < currentProject.totalChapters) {
                contentActions.style.display = 'flex';
            } else {
                contentOutput.innerHTML += '<div class="status-success"><br>Book generation complete! All chapters have been created.</div>';
            }
        }
    } catch (error) {
        contentOutput.innerHTML = '<div class="status-error">Generation failed. Please try again.</div>';
    }
}

function restartProcess() {
    document.getElementById('contentStep').style.display = 'none';
    document.getElementById('analysisStep').style.display = 'block';
    document.getElementById('contentOutput').innerHTML = '';
    currentProject = null;
}