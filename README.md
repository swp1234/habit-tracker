# Habit Tracker - 습관 추적기

**Multi-language Habit Tracking & Goal Achievement App**

A powerful, privacy-first habit tracking application with beautiful data visualization, motivational features, and full PWA support.

[Live Demo](https://dopabrain.com/habit-tracker/) • [Features](#features) • [Installation](#installation) • [Languages](#languages)

---

## Features

### Core Functionality
- **Habit Management**: Add, edit, delete habits with custom icons and categories
- **Daily Tracking**: One-tap completion marking with streak counter
- **Streak Counter**: Real-time 🔥 flame emoji streak display
- **Annual Heatmap**: GitHub-style visualization of your yearly habit completion
- **Weekly/Monthly Stats**: Beautiful bar charts showing achievement rates
- **Achievement Badges**: Unlock badges at 7, 30, 100-day streaks

### Premium Features
- **AI Habit Analysis**: Watch an ad to get AI-powered habit insights
- **Pattern Recognition**: AI analyzes your habit patterns and provides recommendations
- **Share Your Progress**: Export heatmap as image and share on social media

### Design & UX
- **Dark Mode First**: Professional dark theme (#0f0f23) with glassmorphism
- **Responsive Design**: Mobile-first, works on 360px to 2560px screens
- **Microinteractions**: Smooth animations, ripple effects, haptic feedback
- **Accessibility**: WCAG AA compliant, 44px+ touch targets, keyboard navigation
- **Multi-language**: 12 languages with auto-detection

### Technical Features
- **PWA**: Offline support, installable, push notifications
- **Service Worker**: Cache-first strategy with network fallback
- **LocalStorage**: Client-side data persistence (no server needed)
- **Zero Dependencies**: Pure vanilla JavaScript, no frameworks
- **GA4 Integration**: Anonymous analytics tracking
- **AdSense Ready**: Pre-configured ad slots for monetization
- **Schema.org Markup**: SEO-optimized structured data

---

## Supported Languages

| Code | Language | Native |
|------|----------|--------|
| ko | 한국어 | Korean |
| en | English | English |
| ja | 日本語 | Japanese |
| zh | 中文 | Chinese (Simplified) |
| es | Español | Spanish |
| pt | Português | Portuguese |
| id | Bahasa Indonesia | Indonesian |
| tr | Türkçe | Turkish |
| de | Deutsch | German |
| fr | Français | French |
| hi | हिन्दी | Hindi |
| ru | Русский | Russian |

**Language Detection:**
- Automatically detects browser language
- Falls back to saved preference in localStorage
- Defaults to English if language not supported

---

## Installation

### Option 1: Direct Browser Access
1. Open `index.html` in your browser
2. Bookmark or install as PWA (Chrome: Menu → Install app)

### Option 2: Local Server
```bash
cd projects/habit-tracker
python -m http.server 8000
# Visit http://localhost:8000
```

### Option 3: Deployment
1. Copy all files to your web server
2. Ensure `manifest.json` and `sw.js` are accessible
3. Update URLs in `manifest.json` if needed
4. Recommended hosts: GitHub Pages, Netlify, Vercel

---

## File Structure

```
habit-tracker/
├── index.html              # Main HTML with PWA setup
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline support)
├── css/
│   └── style.css           # 2026 design system styles
├── js/
│   ├── app.js              # Main application logic
│   ├── i18n.js             # Multi-language module
│   └── locales/
│       ├── ko.json         # Korean
│       ├── en.json         # English
│       ├── ja.json         # Japanese
│       ├── zh.json         # Chinese
│       ├── es.json         # Spanish
│       ├── pt.json         # Portuguese
│       ├── id.json         # Indonesian
│       ├── tr.json         # Turkish
│       ├── de.json         # German
│       ├── fr.json         # French
│       ├── hi.json         # Hindi
│       └── ru.json         # Russian
├── icon-192.svg            # PWA icon (192x192)
├── icon-512.svg            # PWA icon (512x512)
└── README.md               # This file
```

---

## Usage

### Adding a Habit
1. Tap "Habits" tab
2. Choose from quick templates or tap "+ Add Habit"
3. Set name, icon, category, frequency, goal
4. Save

### Tracking Daily
1. Go to "Today" tab
2. Tap checkmark to mark habit complete
3. View your completion rate and streaks
4. Earn badges as you hit milestones

### Viewing Stats
1. Go to "Statistics" tab
2. See weekly/monthly achievement rates
3. Check unlocked badges and progress
4. Analyze your consistency

### Viewing Heatmap
1. Go to "Heatmap" tab
2. Select a habit or view all together
3. See year-long visualization
4. Share as image (📸 button)

### Premium Analysis
1. Tap 🤖 AI button on any habit
2. Watch an ad
3. Receive personalized habit analysis
4. Get recommendations for improvement

---

## Data Storage

**All data is stored locally on your device:**
- Habits: `localStorage['habits']`
- Completions: `localStorage['completions']`
- Settings: `localStorage['theme']`, `localStorage['language']`
- No cloud sync (privacy-first design)
- Optional: Export as JSON for backup

### Backing Up Your Data
```javascript
// In browser console:
JSON.stringify({
  habits: JSON.parse(localStorage.habits),
  completions: JSON.parse(localStorage.completions)
})
```

---

## Customization

### Changing Theme Color
Edit `:root` in `css/style.css`:
```css
--primary: #2ecc71;  /* Change this */
```

### Adding More Languages
1. Create `js/locales/[lang-code].json`
2. Copy structure from existing files
3. Translate all keys
4. Add to `supportedLanguages` array in `js/i18n.js`

### Modifying Habit Categories
Edit `js/app.js` - Update the `habit-category` select options

### Changing Quote Collection
Edit `quotes` array in `js/app.js`

---

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ Latest 2 | ✅ Latest 2 |
| Firefox | ✅ Latest 2 | ✅ Latest 2 |
| Safari | ✅ 13+ | ✅ 13+ |
| Edge | ✅ Latest 2 | - |
| Samsung Internet | - | ✅ 14+ |

**PWA Features Available:**
- Service Worker: All modern browsers
- Install Prompt: Chrome, Edge, Samsung Internet
- iOS: Limited PWA support (Web Clips)

---

## Performance

- **Page Load**: < 2s (with caching)
- **Bundle Size**: 150 KB (HTML+CSS+JS)
- **Locales**: 12 × 5 KB = 60 KB (loaded on demand)
- **Offline**: Fully functional after first load
- **Storage**: ~100 KB per 1000 habit tracking days

---

## Monetization

### Google AdSense
- **Ad Slots**: Top banner (in-feed) + Bottom banner
- **Estimated RPM**: $1-5 (varies by region)
- **Placement**: Doesn't interfere with UX
- **Setup**: Replace `ca-pub-XXXXXXXXXX` with your AdSense ID

### Premium Features
- **AI Analysis**: Behind watch-ad paywall
- **Future**: Ad-free premium tier possible

### Affiliate Revenue
- Link to productivity tools
- Track habit-related products
- Health/fitness product recommendations

---

## Analytics

**Google Analytics 4 (GA4)**
- **Property ID**: G-J8GSWM40TV
- **Tracking**: Page views, button clicks, language selection
- **Privacy**: Anonymous, no personal data
- **Compliance**: GDPR, CCPA compliant

---

## Accessibility

Meets WCAG 2.1 AA standard:
- ✅ Color contrast ratio 4.5:1 (text on background)
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Touch targets 44x44 pixels minimum
- ✅ Alt text for icons
- ✅ ARIA labels for buttons
- ✅ Semantic HTML structure
- ✅ Focus indicators visible

---

## Privacy Policy

**What We Collect:**
- Habits & completions (stored locally only)
- Anonymous GA4 analytics
- No cookies beyond localStorage
- No personal data tracking

**What We Don't Collect:**
- Location data
- Device info
- User emails
- Passwords
- Payment info

---

## Future Enhancements

- [ ] Cloud sync with Google Drive/iCloud
- [ ] Habit reminders with push notifications
- [ ] Social challenges with friends
- [ ] Advanced analytics (trends, correlations)
- [ ] Custom habit templates
- [ ] Dark/light theme switcher in UI
- [ ] Habit grouping and categories
- [ ] Export to PDF/CSV
- [ ] Integration with other fitness apps

---

## Troubleshooting

### Habits Not Saving
- Check browser localStorage is enabled
- Clear cache and reload
- Try private/incognito mode
- Check browser privacy settings

### Service Worker Not Updating
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Uninstall and reinstall PWA
- Clear Application cache in DevTools

### Heatmap Not Showing
- Ensure you have at least 1 habit created
- Check browser console for errors (F12)
- Verify SVG rendering is enabled

### Wrong Language Showing
- Clear localStorage: `localStorage.clear()`
- Reload page and select language
- Check browser language settings

---

## Development

### Local Testing
```bash
# Start local server
python -m http.server 8000

# Open browser
http://localhost:8000/index.html

# Test PWA offline
DevTools → Application → Service Workers → Offline checkbox
```

### Debugging
- Open DevTools: F12
- Console: Check for errors
- Application: Inspect localStorage, cache
- Network: Monitor requests

### Code Quality
- No linter required (vanilla JS)
- ES6 features supported
- ~1500 lines total JavaScript
- Comments on major functions

---

## License

**MIT License** - Free for personal and commercial use

---

## Support

- **Issues**: Found a bug? Let us know
- **Feature Requests**: Have an idea? Suggest it
- **Contact**: dev@dopabrain.com
- **Community**: Star this repo if you find it helpful!

---

## Changelog

### Version 1.0 (2026-02-10)
- Initial release
- 12-language support
- PWA offline support
- GitHub-style heatmap
- Achievement badges
- Premium AI analysis
- GA4 analytics

---

**Made with ❤️ by the DopaBrain Team**

[Homepage](https://dopabrain.com) • [More Tools](https://dopabrain.com/tools/) • [Contact](mailto:dev@dopabrain.com)
