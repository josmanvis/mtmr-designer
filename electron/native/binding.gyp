{
  "targets": [
    {
      "target_name": "touchbar_native",
      "sources": ["touchbar.mm"],
      "include_dirs": [],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags_cc": ["-std=c++17", "-fobjc-arc"],
      "xcode_settings": {
        "GCC_ENABLE_OBJC_EXCEPTIONS": "YES",
        "CLANG_ENABLE_OBJC_ARC": "YES",
        "MACOSX_DEPLOYMENT_TARGET": "10.12.2",
        "GCC_WARN_64_TO_32_BIT_CONVERSION": "NO"
      },
      "libraries": [
        "-framework Cocoa",
        "-framework DFRFoundation"
      ]
    }
  ]
}