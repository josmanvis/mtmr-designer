//
//  DesignerWindowController.swift
//  MTMR
//
//  MTMR Designer — native window embedding the web-based Touch Bar designer.
//

import Cocoa
import WebKit

class DesignerWindowController: NSObject, NSWindowDelegate {
    static let shared = DesignerWindowController()

    private var window: NSWindow?
    private var webView: WKWebView?

    private let designerURL = URL(string: "http://localhost:3001")!

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

        // Load the designer
        webView.load(URLRequest(url: designerURL))

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    // MARK: - NSWindowDelegate

    func windowWillClose(_ notification: Notification) {
        window = nil
        webView = nil
    }
}
