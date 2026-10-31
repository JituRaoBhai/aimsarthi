# Tasky Android focus permissions

A Trusted Web Activity (the plain Play Store wrapper) cannot give a web page any of these powers. To use them, wrap Tasky in a small
WebView app (Android Studio, "Empty Views Activity"), then:

1. Add `AndroidManifest-additions.xml` to your manifest.
2. Copy `FocusBridge.kt` and `FocusService.kt` (change the package name).
3. In your activity: `webView.settings.javaScriptEnabled = true; webView.addJavascriptInterface(FocusBridge(this), "TaskyNative"); webView.loadUrl("https://YOUR-DOMAIN")`
   and override `shouldOverrideUrlLoading` so only your own domain loads in the WebView (other links open in the browser).
4. Study > Focus mode now shows live permission status and Allow buttons by itself.

## Play Store rules to get right
- **Usage access** and **Display over other apps** are sensitive. In Play Console > App content, explain they are used only for the optional focus session, only after the user taps Allow, and that no usage data leaves the phone (this code never uploads it).
- **Do not** add an Accessibility service for blocking: Play review for that is strict and it is not needed here.
- Put a plain-language line in the Privacy Policy about these permissions before you publish.
- Blocking is a soft nudge (Tasky returns to the front). Android does not let ordinary apps truly lock other apps or touch calls; Android's own Digital Wellbeing Focus mode does that.
