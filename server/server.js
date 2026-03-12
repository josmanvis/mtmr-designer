const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const commentJson = require('comment-json');
const ViteExpress = require('vite-express');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MTMR config file path
const getMTMRConfigPath = () => {
  return path.join(os.homedir(), 'Library', 'Application Support', 'MTMR', 'items.json');
};

// Helper function to read file with comment support
async function readMTMRConfig() {
  try {
    const configPath = getMTMRConfigPath();
    
    // Check if file exists
    try {
      await fs.access(configPath);
    } catch (error) {
      // File doesn't exist, return empty array
      return { success: true, data: [] };
    }

    const content = await fs.readFile(configPath, 'utf8');
    
    // Try to parse with comments first
    try {
      const data = commentJson.parse(content);
      return { success: true, data };
    } catch (parseError) {
      // If comment-json fails, try regular JSON parse
      try {
        const data = JSON.parse(content);
        return { success: true, data };
      } catch (jsonError) {
        return { 
          success: false, 
          error: `Invalid JSON in MTMR config file: ${jsonError.message}` 
        };
      }
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to read MTMR config file: ${error.message}` 
    };
  }
}

// Helper function to write file with comment preservation
async function writeMTMRConfig(data) {
  try {
    const configPath = getMTMRConfigPath();
    
    // Ensure directory exists
    const dir = path.dirname(configPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Format JSON with proper indentation
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(configPath, content, 'utf8');
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to write MTMR config file: ${error.message}` 
    };
  }
}

// API Routes - These must be defined BEFORE ViteExpress.listen()

// GET /api/load-mtmr - Load MTMR configuration
app.get('/api/load-mtmr', async (req, res) => {
  console.log('API: Loading MTMR config...');
  try {
    const result = await readMTMRConfig();
    console.log('API: Load result:', result.success ? 'success' : result.error);
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Successfully loaded MTMR configuration'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('API: Error loading MTMR config:', error);
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`
    });
  }
});

// POST /api/save-mtmr - Save configuration to MTMR
app.post('/api/save-mtmr', async (req, res) => {
  console.log('API: Saving MTMR config...');
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format: expected an array of items'
      });
    }

    const result = await writeMTMRConfig(data);
    console.log('API: Save result:', result.success ? 'success' : result.error);
    if (result.success) {
      res.json({
        success: true,
        message: 'Successfully updated MTMR configuration'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('API: Error saving MTMR config:', error);
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`
    });
  }
});

// GET /api/config-path - Get the MTMR config file path
app.get('/api/config-path', (req, res) => {
  console.log('API: Getting config path...');
  res.json({
    success: true,
    path: getMTMRConfigPath(),
    message: 'MTMR configuration file path'
  });
});

// GET /api/check-mtmr-running - Check if MTMR is running
app.get('/api/check-mtmr-running', (req, res) => {
  console.log('API: Checking if MTMR is running...');
  execFile('pgrep', ['-f', 'MTMR'], (error, stdout) => {
    const isRunning = !error && stdout.trim().length > 0;
    console.log('API: MTMR running check result:', isRunning);
    res.json({
      success: true,
      isRunning
    });
  });
});

// POST /api/launch-mtmr - Launch MTMR application (only if not running)
app.post('/api/launch-mtmr', (req, res) => {
  console.log('API: Launch MTMR request received...');

  // First check if MTMR is already running
  execFile('pgrep', ['-f', 'MTMR'], (checkError, stdout) => {
    const isAlreadyRunning = !checkError && stdout.trim().length > 0;

    if (isAlreadyRunning) {
      console.log('API: MTMR is already running, skipping launch');
      return res.json({
        success: true,
        message: 'MTMR is already running'
      });
    }

    // MTMR is not running, launch it
    console.log('API: Launching MTMR...');
    execFile('open', ['-a', 'MTMR'], (launchError) => {
      if (launchError) {
        console.error('API: Failed to launch MTMR:', launchError);
        return res.status(500).json({
          success: false,
          error: `Failed to launch MTMR: ${launchError.message}`
        });
      }
      console.log('API: MTMR launched successfully');
      res.json({
        success: true,
        message: 'MTMR application launched'
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('API: Health check...');
  res.json({
    success: true,
    message: 'MTMR Designer Server is running',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: `Internal server error: ${err.message}`
  });
});

// Start server with Vite Express integration
const server = ViteExpress.listen(app, PORT, () => {
  console.log(`MTMR Designer Server running on port ${PORT}`);
  console.log(`MTMR config path: ${getMTMRConfigPath()}`);
});

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});