# PerkyFi Demo Video

Built with [Remotion](https://remotion.dev) - React-based video creation.

## Structure

```
video/
├── src/
│   ├── index.ts          # Entry point
│   ├── Root.tsx          # Remotion root
│   └── PerkyFiVideo.tsx  # Main video composition
├── remotion.config.ts    # Remotion config
├── tsconfig.json
└── package.json
```

## Scripts

```bash
# Install dependencies
npm install

# Open Remotion Studio (preview)
npm start

# Render final video
npm run build
# Output: out/video.mp4
```

## Video Scenes (2 minutes)

| Scene | Duration | Content |
|-------|----------|---------|
| Intro | 5s | Logo + tagline |
| Problem | 10s | DeFi complexity |
| Solution | 10s | PerkyFi intro |
| How It Works | 15s | 5-step flow |
| Tech Stack | 10s | Base, Morpho, x402 |
| Demo | 60s | Screen recording |
| Outro | 10s | Links + CTA |

## Customization

Edit `src/PerkyFiVideo.tsx` to:
- Change text/colors
- Adjust timing (durationInFrames)
- Add animations
- Insert screen recordings

## Adding Screen Recording

Replace the `DemoScene` component with:

```tsx
import { Video } from "remotion";

const DemoScene = () => (
  <Video src="/public/demo-recording.mp4" />
);
```

---

*Part of PerkyFi - Base Builder Quest 2026*
