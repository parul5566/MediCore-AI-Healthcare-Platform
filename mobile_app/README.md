# MediCore AI Healthcare — Mobile App

A Flutter mobile application for the MediCore AI Healthcare Platform with advanced animations, glassmorphism UI, and full feature parity with the web application.

## Features

### Authentication
- Animated splash screen with rotating background circles
- Login with glassmorphism design
- Multi-role registration (Patient / Doctor) with tabbed forms
- JWT token-based auth persisted via SharedPreferences
- Demo account quick-fill on login screen

### Patient Portal (5 tabs)
1. **Dashboard** — animated stat cards, upcoming appointments, recent health metrics, pull-to-refresh
2. **Appointments** — book appointments with doctors (date/time picker), view/cancel appointments
3. **Records** — medical records, prescriptions, and lab reports in tabbed view
4. **AI Assistant** — chat with MediCore AI healthcare assistant with typing indicator animation
5. **Profile** — health info, family members (add), health metrics, logout

### Doctor Portal (4 tabs)
1. **Dashboard** — stat cards, upcoming appointments
2. **Appointments** — accept/decline pending appointments
3. **Patients** — view patient list, tap to see medical records & prescriptions
4. **Profile** — doctor info, verification status, logout

### Admin Portal (3 tabs)
1. **Dashboard** — platform-wide stats, recent users
2. **Users** — search, filter by role, activate/suspend users
3. **Profile** — admin info, logout

## Design System
- **Glassmorphism** cards with gradient overlays
- **Animated stat cards** with elastic spring animations
- **Staggered list item animations** (fade + slide)
- **Gradient buttons** with press-scale animation
- **Dark/Light theme** support via Material 3
- Custom color palette with brand gradients

## Getting Started

### Prerequisites
- Flutter SDK >= 3.0.0
- Dart SDK >= 3.0.0
- MediCore web API running (provides /api/mobile/* endpoints)

### Installation
```bash
cd mobile_app
flutter pub get
flutter run
```

### Configuration
Update `lib/config/app_config.dart` with your API base URL:
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://127.0.0.1:3000`
- Physical Device: `http://<your-server-ip>:3000`

### Demo Accounts
| Role    | Email             | Password   |
|---------|-------------------|------------|
| Patient | patient@demo.com  | demo1234   |
| Doctor  | doctor@demo.com   | demo1234   |
| Admin   | admin@demo.com    | demo1234   |

## Project Structure
```
lib/
├── config/
│   └── app_config.dart        # Constants, base URL
├── models/
│   └── models.dart            # All data models
├── services/
│   └── api_service.dart       # HTTP client + auth state
├── theme/
│   └── app_theme.dart         # Colors, gradients, themes
├── widgets/
│   └── app_widgets.dart       # Reusable animated widgets
├── screens/
│   ├── auth/                  # Splash, Login, Register
│   ├── patient/               # Patient portal screens
│   ├── doctor/                # Doctor portal screens
│   └── admin/                 # Admin portal screens
└── main.dart                  # App entry, routing
```

## API Endpoints
The app communicates with the Next.js backend at `/api/mobile/`:
- `POST /auth/login` — JWT login
- `POST /auth/register` — JWT registration
- `GET /auth/me` — Current user
- `GET /dashboard` — Role-based dashboard data
- `GET /doctors` — List doctors
- `GET/POST /appointments` — List/book appointments
- `PATCH /appointments/:id` — Update status
- `GET /medical-records` — Medical records
- `GET /prescriptions` — Prescriptions
- `GET /lab-reports` — Lab reports
- `GET/POST /family-members` — Family members
- `GET/POST /health-metrics` — Health metrics
- `GET/PATCH /notifications` — Notifications
- `GET/POST /messages` — Messages
- `POST /ai/chat` — AI health assistant
- `GET/PATCH /admin/users` — Admin user management
