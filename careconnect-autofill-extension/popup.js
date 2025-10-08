// Popup script for CareConnect Auto-Fill Extension
document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('status');
    
    // Update status
    function updateStatus(message, isError = false) {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#ff6b6b' : 'rgba(255, 255, 255, 0.8)';
    }
    
    // Check if current tab is CareConnect
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        if (!currentUrl.includes('localhost') && !currentUrl.includes('127.0.0.1')) {
            updateStatus('❌ Not on CareConnect', true);
            return;
        }
        
        if (currentUrl.includes('/ngo/events/create')) {
            updateStatus('✅ Create Event page detected');
        } else {
            updateStatus('📄 CareConnect page detected');
        }
    });
    
    // Event listeners for buttons
    document.getElementById('fillEventForm').addEventListener('click', function() {
        updateStatus('🔄 Filling event form...');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'fillEventForm'}, function(response) {
                if (chrome.runtime.lastError) {
                    updateStatus('❌ Error: Page not ready', true);
                } else if (response && response.success) {
                    updateStatus('✅ Event form filled!');
                    setTimeout(() => updateStatus('Ready to auto-fill forms'), 2000);
                } else {
                    updateStatus('❌ Event form not found', true);
                }
            });
        });
    });
    
    document.getElementById('fillNGOForm').addEventListener('click', function() {
        updateStatus('🔄 Filling NGO form...');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'fillNGOForm'}, function(response) {
                if (chrome.runtime.lastError) {
                    updateStatus('❌ Error: Page not ready', true);
                } else if (response && response.success) {
                    updateStatus('✅ NGO form filled!');
                    setTimeout(() => updateStatus('Ready to auto-fill forms'), 2000);
                } else {
                    updateStatus('❌ NGO form not found', true);
                }
            });
        });
    });
    
    document.getElementById('fillProfileForm').addEventListener('click', function() {
        updateStatus('🔄 Filling profile form...');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'fillProfileForm'}, function(response) {
                if (chrome.runtime.lastError) {
                    updateStatus('❌ Error: Page not ready', true);
                } else if (response && response.success) {
                    updateStatus('✅ Profile form filled!');
                    setTimeout(() => updateStatus('Ready to auto-fill forms'), 2000);
                } else {
                    updateStatus('❌ Profile form not found', true);
                }
            });
        });
    });
    
    document.getElementById('fillCampaignForm').addEventListener('click', function() {
        updateStatus('🔄 Filling campaign form...');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'fillCampaignForm'}, function(response) {
                if (chrome.runtime.lastError) {
                    updateStatus('❌ Error: Page not ready', true);
                } else if (response && response.success) {
                    updateStatus('✅ Campaign form filled!');
                    setTimeout(() => updateStatus('Ready to auto-fill forms'), 2000);
                } else {
                    updateStatus('❌ Campaign form not found', true);
                }
            });
        });
    });
});