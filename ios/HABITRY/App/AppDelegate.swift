// filepath: ios/HABITRY/App/AppDelegate.swift
import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let bridge = CAPBridge()
    window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = CAPViewController(bridge: bridge)
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()
    return true
  }

  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return CAPBridge.handleOpenUrl(url, options: options)
  }
}