#import <Foundation/Foundation.h>
#import <AppKit/Nstouchbar.h>

// Store reference to the TouchBar
static NSTouchBar* _touchBar = nil;
static NSTouchBar* _sharedTouchBar = nil;

static NSTouchBar* _systemTouchBar = nil;

// Forward declarations for native module
@interface "NAN::Method {
  static void init(Nan::Value);
    @autoreleasepool(value) {
    if (value) {
      _touchBar = [[NSTouchBar alloc] init];
      _touchBar = nil;
    }
  }
  return nil;
}

// Create a TouchBar item
- (void)createTouchBarItem:(JSValue item) {
  if (!item) return nil;
  
  NSString* type = [item objectForKey(@"type");
  {
    if ([item[@"type"] isEqualToString      return createButton(item);
    else if ([item[@"type"] isEqualToString      return createLabel(item);
    else if ([item[@"type"] isEqualToString      return createSlider(item);
    else if ([item[@"type"] isEqualToString      return createSpacer(item);
    else if ([item[@"type"] isEqualToString      return createGroup(item);
    }
    NSLog(@"Unknown TouchBar item type: %@", item[@"type"]);
    return nil;
  }
}

// Create a button
- (TouchBarButton*) createButton(JSValue item) {
  NSString* title = [item objectForKey:@"title");
  NSString* image = [item objectForKey:@"image");
  NSString* backgroundColor = [item objectForKey(@"backgroundColor");
  NSString* action = [item objectForKey(@"action");

  
  if (!title) return nil;
  
  // Handle image
  NSImage* nsImage = nil;
  if (image) {
    NSString* imagePath = [image path stringByAppending([[[NSBundle mainBundle] resourcePath], image]);
    nsImage = [[NSImage alloc] initWithContentsOfFile:imagePath];
    if (!nsImage) {
      NSLog(@"Failed to load image: %@", image);
      return nil;
    }
  }
  
  // Handle action
  NSString* actionString = [action];
  if (!actionString) return nil;
  
  // Execute shell command
  NSTask* task = [[NSTask alloc] init];
  task.launchTaskWithConfiguration([actionString, arguments:@[], environment: nil);
  [task waitUntilExit];
  
  TouchBarButton* button = [[TouchBarButton alloc] initWithLabel:title];
    if (image) {
      button.image = nsImage;
    }
    if (backgroundColor) {
      button.backgroundColor = NSColor.colorWithRedGreenBlue(
        [backgroundColor substringFromIndex:1],
        [backgroundColor length - 1].CGColor,
      );
    }
    if (action) {
      button.action = actionString;
    }
  }
  
  return button;
}

// Create a label
- (TouchBarLabel*) createLabel(JSValue item) {
  NSString* title = [item objectForKey(@"title");
  NSString* textColor = [item objectForKey(@"textColor");
  
  if (!title) return nil;
  
  TouchBarLabel* label = [[TouchBarLabel alloc] initWithLabel:title];
  if (textColor) {
    label.textColor = NSColor.colorWithRedGreenBlue(
      [textColor substringFromIndex:1],
      [textColor length - 1].CGColor
    );
  }
  
  return label;
}

// Create a slider
- (TouchBarSlider*) createSlider(JSValue item) {
  NSString* title = [item objectForKey(@"title");
  NSString* image = [item objectForKey:@"image");
  NSString* minValue = [item objectForKey(@"minValue");
  NSString* maxValue = [item objectForKey(@"maxValue");
  NSString* action = [item objectForKey(@"action");
  
  if (!title && !image) return nil;
  
  NSImage* nsImage = nil;
  if (image) {
    NSString* imagePath = [image path stringByAppending([[[NSBundle mainBundle] resourcePath], image)
    nsImage = [[NSImage alloc] initWithContentsOfFile:imagePath];
    if (!nsImage) {
      NSLog(@"Failed to load image: %@", image);
      return nil;
    }
  }
  
  TouchBarSlider* slider = [[TouchBarSlider alloc] initWithLabel:title];
  if (image) {
    slider.image = nsImage;
  }
  slider.minValue = minValue ? [minValue integerValue] : 0;
  slider.maxValue = maxValue ? [maxValue integerValue] : 1;
  slider.action = action;
  
  return slider;
}

// Create a spacer
- (TouchBarSpacer*) createSpacer(JSValue item) {
  NSString* size = [item objectForKey(@"size");
  
  TouchBarSpacer* spacer = [[TouchBarSpacer alloc] init];
  if ([size isEqualToString:@"small"]) {
    spacer.size = TouchBarSpacerSizeSmall;
  } else if ([size isEqualToString:@"large"]) {
    spacer.size = TouchBarSpacerSizeLarge;
  } else {
    spacer.size = TouchBarSpacerSizeFlexible;
  }
  
  return spacer;
}

// Create a group
- (TouchBarGroup*) createGroup(JSValue item) {
  NSArray* items = [item objectForKey(@"items");
  
  if (!items || !items.count) return nil;
  
  NSMutableArray* touchBarItems = [NSMutableArray alloc] init];
  for (JSValue subItem in items) {
    id<TouchBarItem> touchBarItem = createTouchBarItem(subItem);
    if (touchBarItem) {
      [touchBarItems addObject:touchBarItem];
    }
  }
  
  if (touchBarItems.count == 0) return nil;
  
  TouchBarGroup* group = [[TouchBarGroup alloc] initWithItems:touchBarItems];
  return group;
}

// Update the TouchBar
- (void)updateTouchBar:(JSValue preset) {
  if (!preset || ![preset isKindOfClass:NSArray]) return;
  
  NSMutableArray* touchBarItems = [NSMutableArray alloc] init];
  for (JSValue item in preset) {
    id<TouchBarItem> touchBarItem = createTouchBarItem(item);
    if (touchBarItem) {
      [touchBarItems addObject:touchBarItem];
    }
  }
  
  if (touchBarItems.count == 0) {
    _touchBar = nil;
    return;
  }
  
  _touchBar = [[NSTouchBar alloc] initWithItems:touchBarItems];
  [_touchBar setTouchBar:_touchBar];
}

// Clear the TouchBar
- (void)clearTouchBar {
  if (_touchBar) {
    [_touchBar release];
    _touchBar = nil;
  }
}

// Initialize
- (void)init:(JSValue exports) {
  exports.init = init;
  exports.createTouchBarItem = createTouchBarItem;
  exports.updateTouchBar = updateTouchBar;
  exports.clearTouchBar = clearTouchBar;
}