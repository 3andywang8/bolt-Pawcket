# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Pawcket" - a React Native pet adoption app built with Expo and TypeScript. The app features a Tinder-like swipe interface for browsing adoptable pets, detailed pet profiles, adoption processes, and feeding/treat features.

## Development Commands

### Core Development
- `npm run dev` - Start Expo development server (with telemetry disabled)
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run lint` - Run Expo linter
- `npm run build:web` - Build web version of the app

## Architecture

### Navigation Structure
The app uses Expo Router for navigation with a tab-based layout:

- **Main Layout** (`app/_layout.tsx`): Root layout with Stack navigation
- **Tab Layout** (`app/(tabs)/_layout.tsx`): Bottom tab navigation with 3 main sections:
  - 探索 (Explore) - Pet browsing with swipe interface
  - 領養 (Adopt) - Adoption-related features
  - 我的 (Profile) - User profile and settings

### Key Features & Screens

#### Pet Discovery (`app/(tabs)/index.tsx`)
- Tinder-style card swipe interface for browsing pets
- Left swipe: "Bless" (祝福) - show support but don't adopt
- Right swipe: "Like" (喜歡) - express adoption interest
- Tap card: Navigate to detailed pet profile
- Animated cards with overlay feedback
- Random shuffling of pet data on load

#### Pet Details (`app/animal/[id].tsx`)
- Detailed pet information and photos
- Adoption requirements and shelter contact info
- Health status and personality traits

#### Additional Screens
- `PaymentScreen.tsx` - Payment processing for treats/donations
- `PaymentSuccessScreen.tsx` - Success confirmation
- `TreatSelectionScreen.tsx` - Select treats to feed pets
- `AdoptionProcessScreen.tsx` - Adoption workflow
- `AdoptionProgressScreen.tsx` - Track adoption status

### Data Structure
Pet data is stored in `app/(tabs)/datas.ts` with the following key fields:
- Basic info: id, name, age, breed, type (cat/dog), gender, weight
- Location and shelter details
- Health status and personality traits
- Images and adoption requirements
- Story/description and shelter contact info

### Technology Stack
- **Framework**: Expo SDK 53 with React Native 0.79
- **Language**: TypeScript
- **Navigation**: Expo Router v5 with file-based routing
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated & Animated API
- **Fonts**: Noto Sans TC (Chinese Traditional)
- **Features**: Camera, video, web browser, haptic feedback, sharing

### UI/UX Patterns
- Consistent warm color scheme with orange accent (#F97316)
- Card-based interfaces with shadows and rounded corners
- Chinese Traditional text throughout
- Haptic feedback on interactions
- Safe area handling for different screen sizes

### Custom Hooks
- `useFrameworkReady.ts` - Signals framework readiness for web compatibility

### Platform Support
- iOS and Android native apps
- Web support via Metro bundler
- TypedRoutes enabled for better type safety