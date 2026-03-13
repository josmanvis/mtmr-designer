# MTMR Designer Launch Checklist

## Pre-Flight Check ✈️

Before launching MTMR 2026, verify these items:

### 1. Web App Built ✅
```bash
# Check if bundled files exist
ls mtmr-src/MTMR/WebApp/index.html
```

**Expected**: File exists
**If not**: Run `./build-webapp.sh`

### 2. Assets Present ✅
```bash
# Check for JavaScript and CSS
ls mtmr-src/MTMR/WebApp/assets/
```

**Expected**: 
- `index-*.js` (JavaScript bundle)
- `index-*.css` (CSS bundle)

**If missing**: Run `./build-webapp.sh`

### 3. Dependencies Installed ✅
```bash
# Check root dependencies
ls node_modules/ | wc -l

# Check server dependencies
ls server/node_modules/ | wc -l
```

**Expected**: Both show > 0
**If not**: 
```bash
pnpm install
cd server && npm install
```

### 4. Build Scripts Executable ✅
```bash
# Check permissions
ls -l build-webapp.sh
ls -l mtmr-src/build-and-copy-webapp.sh
```

**Expected**: Both show `-rwxr-xr-x` (executable)
**If not**: 
```bash
chmod +x build-webapp.sh
chmod +x mtmr-src/build-and-copy-webapp.sh
```

## Launch Sequence 🚀

### Option A: Bundled Mode (Recommended)

1. **Build web app**
   ```bash
   ./build-webapp.sh
   ```
   ✅ Should complete without errors

2. **Open Xcode**
   ```bash
   open mtmr-src/MTMR.xcodeproj
   ```

3. **Select scheme**
   - Scheme: MTMR
   - Destination: My Mac

4. **Build and run**
   - Press ⌘R
   - Or: Product → Run

5. **Verify launch**
   - Status bar icon appears (circle with "MD")
   - Designer window opens automatically
   - Interface loads (not white page)

### Option B: Development Mode

1. **Start dev server**
   ```bash
   pnpm run dev
   ```
   ✅ Should show: "Server running on port 3001"

2. **Remove bundled files** (optional, forces dev mode)
   ```bash
   rm -rf mtmr-src/MTMR/WebApp/*
   ```

3. **Launch from Xcode**
   - Press ⌘R
   - App connects to localhost:3001

4. **Verify hot reload**
   - Edit a React file
   - Changes appear immediately

## Verification Steps ✓

### 1. Check Console Output
Open Console.app and filter for "MTMR 2026":

**Bundled mode should show:**
```
MTMR 2026: Using bundled web app from /path/to/WebApp
```

**Dev mode should show:**
```
MTMR 2026: No bundled web app found, using localhost:3001
```

### 2. Test Designer Interface

- [ ] Window opens automatically
- [ ] Touch Bar preview visible
- [ ] Palette shows element types
- [ ] Can drag elements to Touch Bar
- [ ] Properties panel works
- [ ] JSON output updates
- [ ] Can save to MTMR

### 3. Test API Endpoints

In the Designer:

- [ ] Click "Load from MTMR" - should load config
- [ ] Make changes
- [ ] Click "Save to MTMR" - should save
- [ ] Check file: `~/Library/Application Support/MTMR/items.json`

### 4. Test Menu Bar

Click the "MD" icon in menu bar:

- [ ] Menu appears
- [ ] "Open Designer" works
- [ ] "Preferences" opens config file
- [ ] "About" shows info
- [ ] "Quit" closes app

## Troubleshooting 🔧

### White Page on Launch

**Symptom**: Designer window is blank/white

**Check 1**: Bundled files
```bash
ls mtmr-src/MTMR/WebApp/index.html
```
If missing: `./build-webapp.sh`

**Check 2**: Dev server (if using dev mode)
```bash
curl http://localhost:3001/api/health
```
If fails: `pnpm run dev`

**Check 3**: Console errors
- Open Console.app
- Filter: "MTMR 2026"
- Look for errors

### Build Fails

**Symptom**: `./build-webapp.sh` fails

**Solution 1**: Install dependencies
```bash
pnpm install
cd server && npm install && cd ..
```

**Solution 2**: Clear cache
```bash
rm -rf node_modules dist
pnpm install
```

**Solution 3**: Check Node version
```bash
node --version  # Should be >= 18
```

### Xcode Build Fails

**Symptom**: Xcode shows build errors

**Solution 1**: Clean build
- Product → Clean Build Folder (⇧⌘K)
- Try again

**Solution 2**: Check WebApp folder
```bash
ls mtmr-src/MTMR/WebApp/
```
Should contain files, not be empty

**Solution 3**: Check Xcode logs
- View → Navigators → Show Report Navigator
- Click latest build
- Look for specific errors

### API Calls Fail

**Symptom**: Can't load/save MTMR config

**Check 1**: Config directory exists
```bash
mkdir -p ~/Library/Application\ Support/MTMR
```

**Check 2**: Permissions
```bash
ls -la ~/Library/Application\ Support/MTMR/
```

**Check 3**: Console logs
- Filter: "API:"
- Look for error messages

## Success Criteria ✨

You know it's working when:

1. ✅ App launches without errors
2. ✅ Status bar icon appears
3. ✅ Designer window opens automatically
4. ✅ Interface loads (not white)
5. ✅ Can drag elements
6. ✅ Can edit properties
7. ✅ Can save to MTMR
8. ✅ Touch Bar updates in real MTMR app

## Next Steps

Once verified:

1. **Create your first preset**
   - Drag elements to Touch Bar
   - Configure properties
   - Save to MTMR

2. **Test on Touch Bar**
   - Launch MTMR app (if not running)
   - Touch Bar should update
   - Test your buttons

3. **Explore features**
   - Try different element types
   - Load community presets
   - Customize colors and icons

## Need Help?

Check these docs:

- **[QUICK_START_NATIVE.md](QUICK_START_NATIVE.md)** - Quick start guide
- **[MTMR_DESIGNER_FIX.md](MTMR_DESIGNER_FIX.md)** - Technical details
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[README.md](README.md)** - Full documentation

## Emergency Fallback

If nothing works, use the web version:

```bash
# Start dev server
pnpm run dev

# Open in browser
open http://localhost:3001
```

This always works and has all the same features!
