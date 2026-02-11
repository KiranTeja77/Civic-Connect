# React Native Mobile Application - CivicConnect

This is the React Native mobile version of the CivicConnect issue reporting application.

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android)

### Installation

1. **Install Dependencies**
```bash
cd mobile
npm install
```

2. **Start the Development Server**
```bash
npm start
```

3. **Run on Platform**
- **iOS**: Press `i` in terminal or run `npm run ios`
- **Android**: Press `a` in terminal or run `npm run android`
- **Web**: Press `w` in terminal or run `npm run web`

## 📁 Project Structure

```
mobile/
├── App.js                 # Root component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── navigation/       # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── CitizenTabNavigator.js
│   │   ├── AdminStackNavigator.js
│   │   └── EmployeeStackNavigator.js
│   ├── screens/          # Screen components
│   │   ├── WelcomeScreen.js
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── AdminLoginScreen.js
│   │   │   └── EmployeeLoginScreen.js
│   │   ├── citizen/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── NearbyIssuesScreen.js
│   │   │   ├── MyReportsScreen.js
│   │   │   ├── LeaderboardScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── admin/
│   │   │   └── DashboardScreen.js
│   │   ├── employee/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── ResolveIssueScreen.js
│   │   └── common/
│   │       └── IssueDetailScreen.js
│   ├── components/       # Reusable components
│   ├── context/          # React Context
│   │   ├── AuthContext.js
│   │   └── LanguageContext.js
│   ├── services/         # API services
│   │   └── api.js
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
└── assets/               # Images, fonts, etc.
```

## ✅ Completed

- ✅ Project structure and configuration
- ✅ Navigation setup (Stack, Tab navigators)
- ✅ Auth Context (AsyncStorage integration)
- ✅ Language Context
- ✅ API Service layer
- ✅ Welcome Screen
- ✅ Login/Register screens
- ✅ Admin/Employee Login screens

## 🚧 In Progress

- ⏳ Citizen Dashboard Screen
- ⏳ Report Issue Screen
- ⏳ Maps integration (react-native-maps)
- ⏳ Charts integration (react-native-chart-kit)
- ⏳ Remaining screens

## 📱 Key Features

- **Authentication**: Login, Register, Admin/Employee login
- **Navigation**: Stack and Tab navigation
- **State Management**: Context API for auth and language
- **API Integration**: Full API service layer
- **Responsive Design**: Works on phones and tablets
- **Multi-language Support**: English, Hindi, Santali, Nagpuri

## 🔧 Configuration

### API Base URL
Update in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
const ML_BASE_URL = 'http://your-ml-backend-url';
```

For local development:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
const ML_BASE_URL = 'http://localhost:8000';
```

For Android emulator, use `10.0.2.2` instead of `localhost`.

## 🎨 Styling

All styling uses React Native's `StyleSheet` API. Colors and spacing are consistent with the web version.

## 📝 Notes

- Uses Expo for easier development and deployment
- AsyncStorage for local storage (replaces localStorage)
- React Navigation for routing (replaces react-router-dom)
- All components are functional with Hooks
- Follows mobile-first design principles

## 🚀 Next Steps

1. Complete Citizen Dashboard
2. Add Report Issue screen with image picker
3. Integrate maps (react-native-maps)
4. Add charts (react-native-chart-kit)
5. Complete all remaining screens
6. Add push notifications
7. Add offline support
8. Test on devices
