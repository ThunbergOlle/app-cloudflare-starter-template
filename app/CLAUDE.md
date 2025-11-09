# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

This is a React Native mobile app built with Expo SDK 53 and TypeScript. Key technologies:

- **Framework**: Expo with React Native 0.79.5 and React 19
- **Navigation**: Expo Router with file-based routing, React Navigation bottom tabs
- **Styling**: StyleSheet API with custom color theming
- **Animations**: React Native Reanimated 3.17
- **Camera**: Expo Camera with bottom sheet modals (@gorhom/bottom-sheet)
- **Maps**: Expo Maps (commented out, requires EAS account)
- **Icons**: Expo Vector Icons (Ionicons)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Platform-specific development
npm run android    # Android emulator
npm run ios       # iOS simulator  

# Code quality
npm run lint      # ESLint with expo config

# Reset project (moves starter code to app-example/)
npm run reset-project
```

## Project Architecture

### File-Based Routing Structure
- `app/_layout.tsx` - Root layout with Stack navigation, font loading, theme provider
- `app/(tabs)/_layout.tsx` - Tab navigation layout (currently only Home tab)
- `app/(tabs)/index.tsx` - Home screen with mock map, camera button, attractions list
- `app/camera.tsx` - Camera screen with photo capture and bottom sheet modal
- `app/+not-found.tsx` - 404 error page

### Component Architecture
- Custom `Button` component with primary/secondary variants and icon support
- Uses `@/` path alias for imports (configured in tsconfig.json)
- Color theming system in `constants/Colors.ts`
- Custom hooks for color scheme and theme colors

### Key Features
- Camera integration with photo capture and animated bottom sheet display
- Mock map view with nearby attractions (real map commented out pending EAS setup)
- Gesture handling and reanimated components
- Tab-based navigation with iOS-specific blur effects

## Internationalization (i18n)

The app supports multiple languages (English and Swedish) with a custom translation system:

### Translation Files
- `locales/en.json` - English translations
- `locales/sv.json` - Swedish translations

### Using Translations in Components
```typescript
import { useAppTranslation } from '@/contexts/I18nContext';

export function MyComponent() {
  const { t } = useAppTranslation();
  
  return (
    <Text>{t('section.key')}</Text>
  );
}
```

### Translation Key Structure
Keys are organized in nested sections (e.g., `camera.noAccess`, `auth.login.title`). Always follow existing patterns when adding new keys.

### Adding New Translations
1. Add the key to both `locales/en.json` and `locales/sv.json`
2. Use descriptive, hierarchical keys (e.g., `camera.scanning` not `scanning`)
3. Keep translations contextually appropriate for each language

## Development Notes

- Maps functionality requires Expo Application Services (EAS) account to enable expo-maps
- Uses React Native's new architecture (newArchEnabled: true in app.json)
- Configured for strict TypeScript with path aliases
- iOS-specific styling for tab bar blur effects
- Font loading with SpaceMono custom font

## Working Guidelines

- **Always ask when unsure**: If you're uncertain about how to accomplish a task, implementation approach, or project-specific patterns, ASK instead of guessing. It's more efficient than implementing the wrong solution.
- **Follow existing patterns**: Look at how similar features are implemented in the codebase before creating new solutions
- **Use TodoWrite for complex tasks**: Track progress on multi-step implementations to maintain visibility
- **Always provide translations**: When adding new UI text or translation keys, ALWAYS update both `locales/en.json` and `locales/sv.json` files with appropriate translations
