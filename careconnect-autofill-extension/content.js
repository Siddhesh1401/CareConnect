// Content script for CareConnect Auto-Fill Extension
console.log('🎯 CareConnect Auto-Fill Extension loaded');

// Demo data for Create Event form
const eventDemoData = {
    title: 'Beach Cleanup Drive - Marine Conservation',
    description: 'Join us for an impactful beach cleanup drive to protect marine life and preserve our coastal environment. Volunteers will help collect plastic waste, educate visitors about ocean conservation, and contribute to a cleaner, healthier ecosystem. This family-friendly event includes refreshments and environmental awareness activities.',
    category: 'Environment',
    date: '2025-11-15', // Future date
    startTime: '08:00',
    endTime: '12:00',
    location: {
        address: 'Juhu Beach, Near Hotel Sun-n-Sand',
        area: 'Juhu',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400049',
        landmark: 'Opposite Juhu Police Station'
    },
    capacity: '50',
    requirements: 'Please bring: Water bottle, comfortable walking shoes, sun hat, and gloves if available. We will provide garbage bags, collection tools, and refreshments.',
    whatToExpected: 'Volunteers will work in teams to clean designated beach sections, learn about marine conservation, participate in waste sorting activities, and enjoy a community lunch. Expected duration: 4 hours with breaks.',
    tags: 'environment, cleanup, marine conservation, beach, community, volunteer, sustainability'
};

// Demo data for NGO Registration
const ngoDemoData = {
    organizationName: 'Green Earth Foundation',
    email: 'info@greenearthfoundation.org',
    phone: '+91 9876543210',
    website: 'https://www.greenearthfoundation.org',
    description: 'Green Earth Foundation is dedicated to environmental conservation and sustainability education. We organize community cleanups, tree plantation drives, and awareness campaigns.',
    address: '123, Green Tower, Environmental Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    registrationNumber: 'NGO/2020/ENV/001234',
    establishedYear: '2020'
};

// Demo data for Profile forms
const profileDemoData = {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 9123456789',
    bio: 'Passionate environmental advocate with 3+ years of volunteer experience. Love organizing community events and spreading awareness about sustainability.',
    skills: 'Event Management, Social Media, Environmental Science, Community Outreach',
    location: 'Mumbai, Maharashtra',
    interests: 'Environment, Education, Community Development'
};

// Demo data for Campaign forms
const campaignDemoData = {
    title: 'Save Our Rivers - Water Conservation Campaign',
    description: 'A comprehensive campaign to restore and protect local rivers through community action, education, and policy advocacy.',
    goal: '100000',
    category: 'Environment',
    targetDate: '2025-12-31',
    location: 'Maharashtra, India'
};

// Utility function to simulate typing
function simulateTyping(element, text, delay = 50) {
    return new Promise((resolve) => {
        element.focus();
        element.value = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.value += text.charAt(i);
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                i++;
            } else {
                clearInterval(typeInterval);
                resolve();
            }
        }, delay);
    });
}

// Utility function to select dropdown option
function selectDropdownOption(selectElement, value) {
    if (selectElement) {
        selectElement.value = value;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    return false;
}

// Utility function to fill input field
async function fillField(selector, value, isTextarea = false) {
    const element = document.querySelector(selector);
    if (element) {
        if (isTextarea) {
            await simulateTyping(element, value, 20);
        } else {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
    }
    return false;
}

// Fill Create Event form
async function fillEventForm() {
    console.log('🎯 Starting to fill Event form...');
    
    const selectors = {
        title: 'input[name="title"]',
        description: 'textarea[name="description"]',
        category: 'select[name="category"]',
        date: 'input[name="date"]',
        startTime: 'input[name="startTime"]',
        endTime: 'input[name="endTime"]',
        address: 'input[name="location.address"]',
        area: 'input[name="location.area"]',
        city: 'input[name="location.city"]',
        state: 'select[name="location.state"]',
        pinCode: 'input[name="location.pinCode"]',
        landmark: 'input[name="location.landmark"]',
        capacity: 'input[name="capacity"]',
        requirements: 'textarea[name="requirements"]',
        whatToExpect: 'textarea[name="whatToExpect"]',
        tags: 'input[name="tags"]'
    };
    
    try {
        // Fill basic information
        await fillField(selectors.title, eventDemoData.title);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.description, eventDemoData.description, true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fill category dropdown
        const categorySelect = document.querySelector(selectors.category);
        if (categorySelect) {
            selectDropdownOption(categorySelect, eventDemoData.category);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fill date and time
        await fillField(selectors.date, eventDemoData.date);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.startTime, eventDemoData.startTime);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.endTime, eventDemoData.endTime);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fill location
        await fillField(selectors.address, eventDemoData.location.address);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.area, eventDemoData.location.area);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.city, eventDemoData.location.city);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const stateSelect = document.querySelector(selectors.state);
        if (stateSelect) {
            selectDropdownOption(stateSelect, eventDemoData.location.state);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.pinCode, eventDemoData.location.pinCode);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.landmark, eventDemoData.location.landmark);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fill event details
        await fillField(selectors.capacity, eventDemoData.capacity);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.requirements, eventDemoData.requirements, true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.whatToExpect, eventDemoData.whatToExpected, true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fillField(selectors.tags, eventDemoData.tags);
        
        console.log('✅ Event form filled successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error filling event form:', error);
        return false;
    }
}

// Fill NGO Registration form
async function fillNGOForm() {
    console.log('🎯 Starting to fill NGO form...');
    
    try {
        await fillField('input[name="organizationName"]', ngoDemoData.organizationName);
        await fillField('input[name="email"]', ngoDemoData.email);
        await fillField('input[name="phone"]', ngoDemoData.phone);
        await fillField('input[name="website"]', ngoDemoData.website);
        await fillField('textarea[name="description"]', ngoDemoData.description, true);
        await fillField('input[name="address"]', ngoDemoData.address);
        await fillField('input[name="city"]', ngoDemoData.city);
        await fillField('input[name="pinCode"]', ngoDemoData.pinCode);
        await fillField('input[name="registrationNumber"]', ngoDemoData.registrationNumber);
        await fillField('input[name="establishedYear"]', ngoDemoData.establishedYear);
        
        console.log('✅ NGO form filled successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error filling NGO form:', error);
        return false;
    }
}

// Fill Profile form
async function fillProfileForm() {
    console.log('🎯 Starting to fill Profile form...');
    
    try {
        await fillField('input[name="name"]', profileDemoData.name);
        await fillField('input[name="email"]', profileDemoData.email);
        await fillField('input[name="phone"]', profileDemoData.phone);
        await fillField('textarea[name="bio"]', profileDemoData.bio, true);
        await fillField('input[name="skills"]', profileDemoData.skills);
        await fillField('input[name="location"]', profileDemoData.location);
        await fillField('input[name="interests"]', profileDemoData.interests);
        
        console.log('✅ Profile form filled successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error filling profile form:', error);
        return false;
    }
}

// Fill Campaign form
async function fillCampaignForm() {
    console.log('🎯 Starting to fill Campaign form...');
    
    try {
        await fillField('input[name="title"]', campaignDemoData.title);
        await fillField('textarea[name="description"]', campaignDemoData.description, true);
        await fillField('input[name="goal"]', campaignDemoData.goal);
        await fillField('input[name="targetDate"]', campaignDemoData.targetDate);
        await fillField('input[name="location"]', campaignDemoData.location);
        
        const categorySelect = document.querySelector('select[name="category"]');
        if (categorySelect) {
            selectDropdownOption(categorySelect, campaignDemoData.category);
        }
        
        console.log('✅ Campaign form filled successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error filling campaign form:', error);
        return false;
    }
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message received:', request.action);
    
    switch (request.action) {
        case 'fillEventForm':
            fillEventForm().then(success => {
                sendResponse({ success });
            });
            return true; // Keep message channel open for async response
            
        case 'fillNGOForm':
            fillNGOForm().then(success => {
                sendResponse({ success });
            });
            return true;
            
        case 'fillProfileForm':
            fillProfileForm().then(success => {
                sendResponse({ success });
            });
            return true;
            
        case 'fillCampaignForm':
            fillCampaignForm().then(success => {
                sendResponse({ success });
            });
            return true;
            
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

// Add visual indicator when extension is active
function addExtensionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'careconnect-autofill-indicator';
    indicator.innerHTML = '🎯 Auto-Fill Ready';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        animation: slideIn 0.5s ease-out;
    `;
    
    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 500);
        }
    }, 3000);
}

// Initialize extension
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExtensionIndicator);
} else {
    addExtensionIndicator();
}