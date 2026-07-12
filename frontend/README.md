# Murmur Frontend

React + Vite client for the Murmur real-time chat app.

## Quick start

From the repo root:

```bash
npm install
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173).

## Environment

Copy `.env.example` to `.env` and set the backend origin (no `/api` suffix):

```bash
VITE_API_URL=http://localhost:5001
```

## Scripts

| Command                             | Description              |
| ----------------------------------- | ------------------------ |
| `npm run dev`                       | Start Vite dev server    |
| `npm run build`                     | Production build         |
| `npm run lint`                      | ESLint                   |
| `npm run preview`                   | Preview production build |
| `npx react-doctor@latest --verbose` | React quality audit      |

## Architecture notes

- **State:** Zustand stores (`useAuthStore`, `useChatStore`, `useThemeStore`)
- **Conversation synchronization:** normalized typing/read state helpers keep Socket.IO events aligned with the selected conversation and message status UI
- **Composer:** `MessageInput` uses `useReducer` for text, image preview, and
  upload state; the selected image file is held in a `useRef` to avoid extra
  re-renders
- **Themes:** Light/dark via DaisyUI + `useThemeStore` (not a separate constants
  file)
- **Motion:** Custom ease-out animations in `src/index.css` (`animate-ease-out-dot`,
  `animate-ease-out-float`) for typing indicators and empty states
- **Images:** Direct Cloudinary upload via `src/lib/cloudinary.js`
- **Routing:** Vercel SPA fallback supports direct navigation to `/login` and other client-side routes

## Verified interaction behavior

The deployed application supports authenticated text delivery, live message edits, soft-delete tombstones, typing indicators, and read-receipt state updates across the two-user conversation flow. Deleted messages remain in the conversation timeline as content-cleared tombstones by design.

Full project docs: [Readme.md](../Readme.md)
