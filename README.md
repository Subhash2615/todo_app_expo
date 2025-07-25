# Todo Task Management Mobile Application

## Objective

Develop a cross-platform Todo Task Management Mobile App that enables users to log in via Google and manage personal tasks on the go. The app supports full CRUD operations on tasks, with fields like title, description, due date, status, and priority. The UI is clean, intuitive, and responsive for both Android and iOS. Secure API integration with proper authentication and offline support is included.

## Tech Stack

- **Frontend:** React Native (Expo)
- **Authentication:** Google Sign-In (OAuth)
- **State & Storage:** React state, AsyncStorage (offline support)
- **UI:** react-native-paper, gesture handler, reanimated

## Features

- Google Sign-In authentication
- Full CRUD for tasks (title, description, due date, status, priority)
- Local state management and persistent offline storage
- Tabs, filters, and search for tasks
- No data states, FAB for adding tasks
- Smooth animations for list interactions
- Pull-to-refresh, swipe-to-delete
- Crash reporting ready (Sentry/Firebase Crashlytics integration point)

## Setup & Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create OAuth credentials for your app:
   - **Web:**
     - Add redirect URI: `https://auth.expo.io/@your-username/todo_app_expo`
     - Replace `your-username` with your Expo username.
   - **Android/iOS:**
     - Follow Expo/Google guides for package/bundle identifiers.
3. Copy the generated client IDs into `app/login.tsx`:

```js
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: "YOUR_EXPO_CLIENT_ID",
  iosClientId: "YOUR_IOS_CLIENT_ID",
  androidClientId: "YOUR_ANDROID_CLIENT_ID",
  webClientId: "YOUR_WEB_CLIENT_ID",
});
```

### 3. Start the app

```sh
npx expo start
```

- Scan the QR code with Expo Go (Android/iOS) or open in your browser.

## Usage

- **Login:** Sign in with Google to access your tasks.
- **Task Management:** Add, edit, delete, and mark tasks as complete. Use filters/tabs to view All, Open, or Completed tasks. Search and sort tasks. Swipe to delete, pull to refresh.
- **Logout:** Use the logout button in the app to sign out.

## Project Structure

- `app/` — Main app screens and navigation
- `components/` — Reusable UI components
- `constants/` — Theme/colors
- `hooks/` — Custom hooks

## Notes

- For crash reporting, integrate Sentry or Firebase Crashlytics as needed.
- All task data is stored locally for offline support.

---

For more details, see the code and comments in the project.
