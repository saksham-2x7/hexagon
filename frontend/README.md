# Pair 2: Frontend 3D Avatar Integration (Avaturn)

This folder contains the React Three Fiber (R3F) boilerplate to load the realistic AI Teacher avatar you designed on Avaturn.me.

## How to get your Avaturn model working:

Since the AI agent cannot access your logged-in Avaturn account to download the file directly:
1. Go to your screen on **Avaturn.me** (shown in your screenshot).
2. Click the **Export / Download** button in the bottom right.
3. Choose the `.glb` format (Ensure ARKit Blendshapes are included in the export options if prompted).
4. Save the downloaded file as exactly: `frontend/public/models/teacher_avatar.glb`.

## How to get the "Teaching" animations:
1. Go to **Mixamo.com**.
2. Search for animations like "Talking", "Explaining", or "Idle".
3. Download them as `.fbx`.
4. Import them into Blender, and export the animations as a single `.glb` file named `teacher_animations.glb`.
5. Place it at `frontend/public/models/teacher_animations.glb`.

## Component Structure
- `src/components/TeacherAvatar.jsx`: Handles loading the `.glb`, crossfading between teacher animations, and driving the `jawOpen` blendshape to simulate talking.
- `src/components/AvatarCanvas.jsx`: Sets up the 3D scene (lighting, shadows, camera) to render the avatar beautifully on the web.

## Dependencies
You will need to install:
```bash
npm install three @react-three/fiber @react-three/drei
```
