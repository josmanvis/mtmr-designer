//
//  AppDelegate.swift
//  MTMR
//
//  Created by Anton Palgunov on 16/03/2018.
//  Copyright © 2018 Anton Palgunov. All rights reserved.
//

import Cocoa
import Sparkle

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
    var isBlockedApp: Bool = false

    private var fileSystemSource: DispatchSourceFileSystemObject?

    func applicationDidFinishLaunching(_: Notification) {
        NSLog("MTMR 2026: App Starting Up...")

        // 1. Status bar icon FIRST — this must succeed before anything risky
        NSLog("MTMR 2026: Creating Status Bar Item...")
        if let button = statusItem.button {
            button.image = createMenuBarIcon()
            NSLog("MTMR 2026: Status Item Button Image Set.")
        } else {
            NSLog("MTMR 2026: ERROR — Status Item Button is nil!")
        }
        createMenu()
        NSLog("MTMR 2026: Menu Created.")

        // 2. Accessibility check
        NSLog("MTMR 2026: Checking Accessibility Permissions...")
        let options = [kAXTrustedCheckOptionPrompt.takeRetainedValue() as NSString: true] as NSDictionary
        let accessibilityEnabled = AXIsProcessTrustedWithOptions(options)
        NSLog("MTMR 2026: Accessibility Enabled: %@", accessibilityEnabled ? "true" : "false")

        // 3. Sparkle (deferred — old framework may crash on macOS 26)
        DispatchQueue.main.async {
            NSLog("MTMR 2026: Configuring Sparkle...")
            SUUpdater.shared().automaticallyDownloadsUpdates = false
            SUUpdater.shared().automaticallyChecksForUpdates = true
            SUUpdater.shared().checkForUpdatesInBackground()
            NSLog("MTMR 2026: Sparkle configured.")
        }

        // 4. Touch Bar setup (deferred — uses private APIs that may fail)
        DispatchQueue.main.async {
            NSLog("MTMR 2026: Setting up Touch Bar Control Strip...")
            TouchBarController.shared.setupControlStripPresence()
            NSLog("MTMR 2026: Control Strip Presence Setup Complete.")
        }

        // 5. File watching and notifications
        reloadOnDefaultConfigChanged()
        NSLog("MTMR 2026: Default Config Watcher Started.")

        NSWorkspace.shared.notificationCenter.addObserver(self, selector: #selector(updateIsBlockedApp), name: NSWorkspace.didLaunchApplicationNotification, object: nil)
        NSWorkspace.shared.notificationCenter.addObserver(self, selector: #selector(updateIsBlockedApp), name: NSWorkspace.didTerminateApplicationNotification, object: nil)
        NSWorkspace.shared.notificationCenter.addObserver(self, selector: #selector(updateIsBlockedApp), name: NSWorkspace.didActivateApplicationNotification, object: nil)
        // 6. Auto-open the Designer window on launch
        DispatchQueue.main.async {
            NSLog("MTMR 2026: Opening Designer window...")
            DesignerWindowController.shared.showWindow()
        }

        NSLog("MTMR 2026: Startup complete.")
    }

    func applicationWillTerminate(_: Notification) {}

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }

    /// Generates a template menu bar icon with "MD" text inside a circle.
    func createMenuBarIcon() -> NSImage {
        let size = NSSize(width: 18, height: 18)
        let image = NSImage(size: size, flipped: false) { rect in
            let inset: CGFloat = 0.5
            let circleRect = rect.insetBy(dx: inset, dy: inset)
            let path = NSBezierPath(ovalIn: circleRect)
            path.lineWidth = 1.2
            NSColor.black.setStroke()
            path.stroke()

            let text = "MD" as NSString
            let font = NSFont.systemFont(ofSize: 9.0, weight: .semibold)
            let attrs: [NSAttributedString.Key: Any] = [
                .font: font,
                .foregroundColor: NSColor.black,
            ]
            let textSize = text.size(withAttributes: attrs)
            let textRect = NSRect(
                x: (rect.width - textSize.width) / 2,
                y: (rect.height - textSize.height) / 2,
                width: textSize.width,
                height: textSize.height
            )
            text.draw(in: textRect, withAttributes: attrs)
            return true
        }
        image.isTemplate = true
        return image
    }

    @objc func openDesigner(_: Any?) {
        DesignerWindowController.shared.showWindow()
    }

    @objc func showAbout(_: Any?) {
        let credits = NSMutableAttributedString()

        let titleAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.boldSystemFont(ofSize: 12),
            .foregroundColor: NSColor.labelColor,
        ]
        let bodyAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 11),
            .foregroundColor: NSColor.secondaryLabelColor,
        ]
        let linkAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 11),
            .foregroundColor: NSColor.linkColor,
            .cursor: NSCursor.pointingHand,
        ]

        credits.append(NSAttributedString(string: "MTMR Designer", attributes: titleAttrs))
        credits.append(NSAttributedString(string: "\nby Jose", attributes: bodyAttrs))
        credits.append(NSAttributedString(string: " (", attributes: bodyAttrs))
        credits.append(NSAttributedString(string: "github.com/josmanvis", attributes: [
            .font: NSFont.systemFont(ofSize: 11),
            .foregroundColor: NSColor.linkColor,
            .link: URL(string: "https://github.com/josmanvis")!,
            .cursor: NSCursor.pointingHand,
        ]))
        credits.append(NSAttributedString(string: ")\n\n", attributes: bodyAttrs))

        credits.append(NSAttributedString(string: "Based on MTMR", attributes: titleAttrs))
        credits.append(NSAttributedString(string: "\nby Anton Palgunov", attributes: bodyAttrs))
        credits.append(NSAttributedString(string: " (", attributes: bodyAttrs))
        credits.append(NSAttributedString(string: "github.com/Toxblh", attributes: [
            .font: NSFont.systemFont(ofSize: 11),
            .foregroundColor: NSColor.linkColor,
            .link: URL(string: "https://github.com/Toxblh/MTMR")!,
            .cursor: NSCursor.pointingHand,
        ]))
        credits.append(NSAttributedString(string: ")", attributes: bodyAttrs))

        // Center the text
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.alignment = .center
        credits.addAttribute(.paragraphStyle, value: paragraphStyle, range: NSRange(location: 0, length: credits.length))

        let options: [NSApplication.AboutPanelOptionKey: Any] = [
            .credits: credits,
            .applicationVersion: "2026.1",
        ]
        NSApp.orderFrontStandardAboutPanel(options: options)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc func updateIsBlockedApp() {
        if let frontmostAppId = TouchBarController.shared.frontmostApplicationIdentifier {
            isBlockedApp = AppSettings.blacklistedAppIds.firstIndex(of: frontmostAppId) != nil
        } else {
            isBlockedApp = false
        }
        createMenu()
    }

    @objc func openPreferences(_: Any?) {
        let task = Process()
        let appSupportDirectory = NSSearchPathForDirectoriesInDomains(.applicationSupportDirectory, .userDomainMask, true).first!.appending("/MTMR")
        let presetPath = appSupportDirectory.appending("/items.json")
        task.launchPath = "/usr/bin/open"
        task.arguments = [presetPath]
        task.launch()
    }

    @objc func toggleControlStrip(_ item: NSMenuItem) {
        item.state = item.state == .on ? .off : .on
        AppSettings.showControlStripState = item.state == .off
        TouchBarController.shared.resetControlStrip()
    }

    @objc func toggleBlackListedApp(_: Any?) {
        if let appIdentifier = TouchBarController.shared.frontmostApplicationIdentifier {
            if let index = TouchBarController.shared.blacklistAppIdentifiers.firstIndex(of: appIdentifier) {
                TouchBarController.shared.blacklistAppIdentifiers.remove(at: index)
            } else {
                TouchBarController.shared.blacklistAppIdentifiers.append(appIdentifier)
            }
            
            AppSettings.blacklistedAppIds = TouchBarController.shared.blacklistAppIdentifiers
            TouchBarController.shared.updateActiveApp()
            updateIsBlockedApp()
        }
    }

    @objc func toggleHapticFeedback(_ item: NSMenuItem) {
        item.state = item.state == .on ? .off : .on
        AppSettings.hapticFeedbackState = item.state == .on
    }

    @objc func toggleMultitouch(_ item: NSMenuItem) {
        item.state = item.state == .on ? .off : .on
        AppSettings.multitouchGestures = item.state == .on
        TouchBarController.shared.basicView?.legacyGesturesEnabled = item.state == .on
    }

    @objc func openPreset(_: Any?) {
        let dialog = NSOpenPanel()

        dialog.title = "Choose a items.json file"
        dialog.showsResizeIndicator = true
        dialog.showsHiddenFiles = true
        dialog.canChooseDirectories = false
        dialog.canCreateDirectories = false
        dialog.allowsMultipleSelection = false
        dialog.allowedFileTypes = ["json"]
        dialog.directoryURL = NSURL.fileURL(withPath: NSSearchPathForDirectoriesInDomains(.applicationSupportDirectory, .userDomainMask, true).first!.appending("/MTMR"), isDirectory: true)

        if dialog.runModal() == .OK, let path = dialog.url?.path {
            TouchBarController.shared.reloadPreset(path: path)
        }
    }

    @objc func toggleStartAtLogin(_: Any?) {
        LaunchAtLoginController().setLaunchAtLogin(!LaunchAtLoginController().launchAtLogin, for: NSURL.fileURL(withPath: Bundle.main.bundlePath))
        createMenu()
    }

    func createMenu() {
        let menu = NSMenu()

        let startAtLogin = NSMenuItem(title: "Start at login", action: #selector(toggleStartAtLogin(_:)), keyEquivalent: "L")
        startAtLogin.state = LaunchAtLoginController().launchAtLogin ? .on : .off

        let toggleBlackList = NSMenuItem(title: "Toggle current app in blacklist", action: #selector(toggleBlackListedApp(_:)), keyEquivalent: "B")
        toggleBlackList.state = isBlockedApp ? .on : .off

        let hideControlStrip = NSMenuItem(title: "Hide Control Strip", action: #selector(toggleControlStrip(_:)), keyEquivalent: "T")
        hideControlStrip.state = AppSettings.showControlStripState ? .off : .on

        let hapticFeedback = NSMenuItem(title: "Haptic Feedback", action: #selector(toggleHapticFeedback(_:)), keyEquivalent: "H")
        hapticFeedback.state = AppSettings.hapticFeedbackState ? .on : .off

        let multitouchGestures = NSMenuItem(title: "Volume/Brightness gestures", action: #selector(toggleMultitouch(_:)), keyEquivalent: "")
        multitouchGestures.state = AppSettings.multitouchGestures ? .on : .off

        let settingSeparator = NSMenuItem(title: "Settings", action: nil, keyEquivalent: "")
        settingSeparator.isEnabled = false

        menu.addItem(withTitle: "Open Designer", action: #selector(openDesigner(_:)), keyEquivalent: "D")
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "Preferences", action: #selector(openPreferences(_:)), keyEquivalent: ",")
        menu.addItem(withTitle: "Open preset", action: #selector(openPreset(_:)), keyEquivalent: "O")
        menu.addItem(withTitle: "Check for Updates...", action: #selector(SUUpdater.checkForUpdates(_:)), keyEquivalent: "").target = SUUpdater.shared()

        menu.addItem(NSMenuItem.separator())
        menu.addItem(settingSeparator)
        menu.addItem(hapticFeedback)
        menu.addItem(hideControlStrip)
        menu.addItem(toggleBlackList)
        menu.addItem(startAtLogin)
        menu.addItem(multitouchGestures)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "About MTMR Designer", action: #selector(showAbout(_:)), keyEquivalent: "")
        menu.addItem(withTitle: "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        statusItem.menu = menu
    }

    func reloadOnDefaultConfigChanged() {
        let file = NSURL.fileURL(withPath: standardConfigPath)

        let fd = open(file.path, O_EVTONLY)

        fileSystemSource = DispatchSource.makeFileSystemObjectSource(fileDescriptor: fd, eventMask: .write, queue: DispatchQueue(label: "DefaultConfigChanged"))

        fileSystemSource?.setEventHandler(handler: {
            print("Config changed, reloading...")
            DispatchQueue.main.async {
                TouchBarController.shared.reloadPreset(path: file.path)
            }
        })

        fileSystemSource?.setCancelHandler(handler: {
            close(fd)
        })

        fileSystemSource?.resume()
    }
}
