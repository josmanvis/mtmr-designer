//
//  DesignerWindowController.swift
//  MTMR
//
//  MTMR Designer — native window embedding the web-based Touch Bar designer.
//  Uses bundled web files when available (production), falls back to localhost (development).
//

import Cocoa
import WebKit

class DesignerWindowController: NSObject, NSWindowDelegate {
    static let shared = DesignerWindowController()

    private var window: NSWindow?
    private var webView: WKWebView?

    /// Returns the path to bundled web app files, or nil if not bundled (development mode).
    private var bundledWebAppURL: URL? {
        guard let resourcePath = Bundle.main.resourcePath else { return nil }
        let webAppPath = (resourcePath as NSString).appendingPathComponent("WebApp")
        let indexPath = (webAppPath as NSString).appendingPathComponent("index.html")
        if FileManager.default.fileExists(atPath: indexPath) {
            return URL(fileURLWithPath: webAppPath)
        }
        return nil
    }

    /// Whether the app has bundled web files (production build).
    var isBundled: Bool {
        return bundledWebAppURL != nil
    }

    func showWindow() {
        // If window exists, just bring it forward
        if let window = window {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        // Create WKWebView with preferences
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        // Register custom scheme handler for bundled mode
        if let webRoot = bundledWebAppURL {
            let handler = AppSchemeHandler(webRoot: webRoot)
            config.setURLSchemeHandler(handler, forURLScheme: AppSchemeHandler.scheme)
            NSLog("MTMR 2026: Using bundled web app from %@", webRoot.path)
        } else {
            NSLog("MTMR 2026: No bundled web app found, using localhost:3001")
        }

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.autoresizingMask = [.width, .height]
        self.webView = webView

        // Create window
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1280, height: 820),
            styleMask: [.titled, .closable, .resizable, .miniaturizable],
            backing: .buffered,
            defer: false
        )
        window.title = "MTMR Designer"
        window.minSize = NSSize(width: 900, height: 600)
        window.delegate = self
        window.contentView = webView
        window.center()
        window.setFrameAutosaveName("MTMRDesignerWindow")

        // Dark title bar to match the designer UI
        window.titlebarAppearsTransparent = true
        window.backgroundColor = NSColor(red: 0.063, green: 0.063, blue: 0.075, alpha: 1.0) // #101013

        self.window = window

        // Load the designer — bundled or dev server
        if bundledWebAppURL != nil {
            let url = URL(string: "\(AppSchemeHandler.scheme)://app/index.html")!
            webView.load(URLRequest(url: url))
        } else {
            webView.load(URLRequest(url: URL(string: "http://localhost:3001")!))
        }

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    // MARK: - NSWindowDelegate

    func windowWillClose(_ notification: Notification) {
        window = nil
        webView = nil
    }
}
