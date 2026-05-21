# MedTrack 💊

MedTrack is a modern web application for medication and health tracking.  
It helps users manage prescriptions, reminders, emergency contacts, and personal health routines in a simple and intuitive interface.

---

## 🚀 Features

- 🔐 Authentication (Sign up / Login / Logout)
- 👤 User profile management
- 💊 Medication tracking
- 📅 Health routines and reminders
- 🆘 Emergency contact management
- 🌙 Dark / Light mode support
- ⚡ Fast and responsive UI (Vite + React)

---

## 🧱 Tech Stack

- React
- Vite
- CSS Modules
- Context API (Auth & Theme)
- Supabase (Authentication & backend)
- ESLint (code quality)

---

## 📁 Project Structure

```txt
src/
├── components/       # Reusable UI components
├── contexts/         # Auth and global state
├── hooks/            # Custom hooks (useTheme, useForm)
├── screens/          # Pages/screens (Auth, Dashboard, etc.)
├── services/         # API and Supabase logic
├── styles/           # Global styles and variables
├── utils/            # Helpers and constants
├── App.jsx
└── main.jsx
````

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/medtrack.git
cd medtrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

---

## 🧪 Linting

Run ESLint:

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint:fix
```

---

## 📦 Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---
