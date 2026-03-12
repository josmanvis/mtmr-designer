/**
 * File system utilities for MTMR configuration management
 * Uses server-side API endpoints for direct filesystem access
 */

/**
 * Get the MTMR config file path from server
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
export async function getMTMRConfigPath() {
  try {
    const response = await fetch('/api/config-path');
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to get MTMR config path: ${error.message}`
    };
  }
}

/**
 * Load configuration from MTMR config file
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function loadFromMTMR() {
  try {
    console.log('Attempting to load MTMR config from:', '/api/load-mtmr');
    const response = await fetch('/api/load-mtmr');
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Load result:', result);
    return result;
  } catch (error) {
    console.error('Error loading MTMR config:', error);
    return {
      success: false,
      error: `Failed to load MTMR config: ${error.message}`
    };
  }
}

/**
 * Save configuration to MTMR config file
 * @param {string} jsonContent - The JSON content to save
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveToMTMR(jsonContent) {
  try {
    console.log('Attempting to save MTMR config to:', '/api/save-mtmr');
    // Parse JSON to ensure it's valid
    let data;
    try {
      data = JSON.parse(jsonContent);
    } catch (parseError) {
      return {
        success: false,
        error: `Invalid JSON content: ${parseError.message}`
      };
    }

    const response = await fetch('/api/save-mtmr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data })
    });

    console.log('Save response status:', response.status);
    const result = await response.json();
    console.log('Save result:', result);
    return result;
  } catch (error) {
    console.error('Error saving MTMR config:', error);
    return {
      success: false,
      error: `Failed to save MTMR config: ${error.message}`
    };
  }
}

/**
 * Check if server is running
 * @returns {Promise<boolean>}
 */
export async function isServerRunning() {
  try {
    console.log('Checking server health at:', '/api/health');
    const response = await fetch('/api/health');
    console.log('Health check response status:', response.status);
    const result = await response.json();
    console.log('Health check result:', result);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}

/**
 * Check if MTMR is running
 * @returns {Promise<{success: boolean, isRunning: boolean}>}
 */
export async function isMTMRRunning() {
  try {
    console.log('Checking if MTMR is running...');
    const response = await fetch('/api/check-mtmr-running');
    const result = await response.json();
    console.log('MTMR running check result:', result.isRunning);
    return result;
  } catch (error) {
    console.error('Error checking MTMR status:', error);
    return {
      success: false,
      isRunning: false
    };
  }
}

/**
 * Launch MTMR application (only if not already running)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function launchMTMR() {
  try {
    console.log('Attempting to launch MTMR...');
    const response = await fetch('/api/launch-mtmr', {
      method: 'POST',
    });
    const result = await response.json();
    if (result.success) {
      console.log('MTMR launch request completed:', result.message);
    } else {
      console.error('Failed to launch MTMR:', result.error);
    }
    return result;
  } catch (error) {
    console.error('Error launching MTMR:', error);
    return {
      success: false,
      error: `Failed to launch MTMR: ${error.message}`
    };
  }
}