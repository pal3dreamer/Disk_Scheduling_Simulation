# Disk Scheduling Simulator - Manual Testing Checklist

**Test Date:** April 14, 2026  
**Tester:** [Your Name]  
**Browser:** [Chrome/Firefox/Edge/Safari]  
**URL:** http://localhost:5173

---

## Test Instructions

Open http://localhost:5173 in your web browser and follow the checklist below.

---

## 1. Initial Page Load (30 seconds)

- [ ] Page loads without errors
- [ ] No console errors (F12 → Console tab)
- [ ] UI appears in under 3 seconds
- [ ] Dark background gradient visible
- [ ] All controls are responsive (not frozen)

**Result:** PASS / FAIL

---

## 2. Canvas & Grid Rendering (1 minute)

- [ ] Canvas element is visible (takes up most of screen)
- [ ] Background is dark (slate/gray color)
- [ ] Horizontal grid lines visible (multiple tracks)
- [ ] Vertical grid lines visible (time divisions)
- [ ] Grid is clear and not flickering
- [ ] Grid lines are evenly spaced
- [ ] Time labels visible on top edge (0, 50, 100, etc)

**Result:** PASS / FAIL

---

## 3. Play Button & Animation (2 minutes)

### Initial State
- [ ] Play button is visible (large button in middle area)
- [ ] Play button is clearly labeled or has play icon
- [ ] Button has hover effect when mouse moves over it

### Click Play Button
- [ ] Button changes to Pause icon/label
- [ ] Animation starts immediately
- [ ] Disk head (bright circle) appears on timeline
- [ ] Disk head starts moving smoothly

### Animation Quality
- [ ] Movement is smooth (no stuttering)
- [ ] No frame drops or lag
- [ ] Animation runs for full 5 seconds
- [ ] Movement path is consistent and logical
- [ ] Circle representing disk head is clearly visible

**Result:** PASS / FAIL

---

## 4. Pause Button (30 seconds)

- [ ] Pause button appears after clicking play
- [ ] Click Pause button
- [ ] Animation stops immediately
- [ ] Disk head freezes in current position
- [ ] Button changes back to Play icon/label
- [ ] Click Play again → animation resumes from paused position

**Result:** PASS / FAIL

---

## 5. Speed Control (1 minute)

- [ ] Speed slider/control is visible (usually near play button)
- [ ] Slider has minimum and maximum values
- [ ] Click Play to start animation
- [ ] Adjust speed slider to lower value
- [ ] Animation slows down noticeably
- [ ] Adjust speed slider to higher value
- [ ] Animation speeds up noticeably
- [ ] Speed change happens smoothly (no jitter)

**Result:** PASS / FAIL

---

## 6. Algorithm Label & Selector (1 minute)

- [ ] Algorithm label visible (top-right area)
- [ ] Shows algorithm name (FCFS, SCAN, C-SCAN, LOOK, C-LOOK, etc)
- [ ] Algorithm selector is accessible (dropdown or buttons)
- [ ] Can select different algorithms
- [ ] After selection change:
  - [ ] Algorithm label updates
  - [ ] Disk visualization updates
  - [ ] Animation color/style changes if applicable

**Result:** PASS / FAIL

---

## 7. Metrics Sidebar (1 minute)

### Sidebar Visibility
- [ ] Metrics sidebar is visible on right side of screen
- [ ] Shows statistics (seek time, requests completed, etc)
- [ ] Metrics panel has clean, readable layout
- [ ] Text is easily readable (good contrast)

### Metrics Toggle Button
- [ ] Toggle button visible (bottom-right area)
- [ ] Button shows "▶ Metrics" or "◀ Metrics" label
- [ ] Click button → sidebar disappears
- [ ] Click button again → sidebar reappears
- [ ] Animation works smoothly (no jarring transitions)

### Metrics Updates
- [ ] Play animation
- [ ] Watch metrics values update in real-time
- [ ] Values make sense (seek time increases, etc)
- [ ] Updates are frequent (no stalled display)

**Result:** PASS / FAIL

---

## 8. Reset Button (30 seconds)

- [ ] Reset button is visible (near play/pause controls)
- [ ] Start animation (click play)
- [ ] Click Reset button
- [ ] Animation stops
- [ ] Disk head returns to starting position
- [ ] Metrics reset to initial values
- [ ] Play button changes back to play state (not pause)

**Result:** PASS / FAIL

---

## 9. Layout & Responsiveness (1 minute)

- [ ] Layout is clean and organized
- [ ] No overlapping elements
- [ ] All buttons are in logical positions
- [ ] Canvas takes up appropriate screen space
- [ ] Controls don't cover important visualization
- [ ] Text is readable throughout

### Responsive Test (if time allows)
- [ ] Resize browser window to different sizes
- [ ] Layout adapts appropriately
- [ ] Canvas scales with window
- [ ] Controls remain accessible

**Result:** PASS / FAIL

---

## 10. Console & Error Checks (1 minute)

- [ ] Open browser dev console (F12)
- [ ] Click Console tab
- [ ] Watch for errors:
  - [ ] No red "Error" messages
  - [ ] No red "Uncaught" messages
  - [ ] Only normal Vite/React messages are OK
  
### Network Tab Check
- [ ] Click Network tab
- [ ] Reload page (F5)
- [ ] All network requests should be green (200 status)
- [ ] No red (404, 500) errors
- [ ] No failed requests

**Result:** PASS / FAIL

---

## 11. Visual Quality & Polish (1 minute)

- [ ] Colors look good and professional
- [ ] Text is clear and readable
- [ ] No blurry or pixelated elements
- [ ] Animations are smooth (not janky)
- [ ] No visual artifacts or glitches
- [ ] Lighting/contrast is good
- [ ] Overall appearance is polished

**Result:** PASS / FAIL

---

## 12. Cross-Feature Integration (1 minute)

Perform these combined actions:

1. [ ] Select algorithm → run animation → change speed → no issues
2. [ ] Play animation → toggle metrics → pause → animation still paused
3. [ ] Run animation → reset → metrics clear → resume play works
4. [ ] Change speed during animation → animation smoothly adjusts
5. [ ] All features work together without conflicts

**Result:** PASS / FAIL

---

## Overall Summary

**Total Checks:** 12 categories

**Passed:** ___/12  
**Failed:** ___/12

### Overall Result:

- [ ] **PASS** - All tests passed, application is fully functional
- [ ] **PASS WITH MINOR ISSUES** - Most features work, minor visual issues only
- [ ] **FAIL** - Critical features not working

---

## Issues Found (if any)

| Issue | Severity | Description | Steps to Reproduce |
|-------|----------|-------------|-------------------|
| | | | |
| | | | |
| | | | |

---

## Performance Notes

**Animation Smoothness:** (1-10 scale)  
- Smoothness rating: ___/10
- Any stuttering observed? YES / NO
- Frame rate appears: Smooth / Acceptable / Choppy

**Load Time:**  
- Initial page load: ~___ seconds
- Animation startup: ~___ seconds
- Responsive to clicks: YES / NO

---

## Browser & System Information

- Browser: ___________________
- Browser Version: ___________________
- OS: ___________________
- Screen Resolution: ___________________
- GPU: ___________________ (if known)

---

## Additional Notes

[Space for any other observations or comments]

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Sign-Off

**Tester Name:** _____________________  
**Date:** _____________________  
**Time Taken:** _____ minutes  
**Overall Assessment:** [ ] Ready for Production [ ] Needs Work [ ] Blocked

---

**Test Completed Successfully!** ✓

All checklist items have been verified and documented.
