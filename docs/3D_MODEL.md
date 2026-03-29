# Hero 3D model (React Three Fiber)

The homepage hero embeds a **GLB** character in a circular frame. The stack is **React Three Fiber** (`@react-three/fiber`), **Drei** helpers (`@react-three/drei`), and **three** as the underlying renderer.

---

## Where the code lives

| Piece | File | Role |
|--------|------|------|
| Page layout wrapper | `src/components/home/hero/HeroModel.jsx` | Rounded container, theme-aware background |
| WebGL canvas | `src/components/home/hero/model/SceneContainer.jsx` | `<Canvas>`, theme background color, `Suspense` |
| Camera | `src/components/home/hero/model/CameraSetup.jsx` | `PerspectiveCamera`, `OrbitControls` (zoom/pan/rotate disabled; used to lock initial view) |
| Lights | `src/components/home/hero/model/LightSetup.jsx` | Ambient + spot + point lights |
| Model + motion | `src/components/home/hero/model/UsagiModel.jsx` | `useGLTF`, mouse-follow rotation, hover sound |
| Audio on hover | `src/hooks/useAudioHover.js` | Plays an MP3 when pointer enters the model mesh |

The hero section composes text + model in `src/components/home/hero/HeroSection.jsx`.

---

## Replacing the `.glb` file

1. Export or download a model as **GLB** (binary glTF). Prefer **reasonable poly count** and **compressed textures** so first paint stays fast on mobile.
2. Place the file under **`public/`**, e.g. `public/my-character.glb`. Anything in `public/` is served from the site root, so the URL is `/my-character.glb`.
3. In `UsagiModel.jsx`, point `useGLTF` at that path:

   ```js
   const { scene } = useGLTF("/my-character.glb");
   ```

4. Adjust **`scale`** and **`position`** on the `<primitive>` until the model sits nicely inside the circle. Values depend on model size and origin (Blender: apply scale, set origin to geometry center or feet as needed).
5. Optionally **rename** `UsagiModel` → `HeroCharacterModel` (or similar) and update imports in `SceneContainer.jsx` for clarity.

**Copyright:** Use only assets you are allowed to redistribute and display publicly (your own work, licensed stock, or explicit permission).

---

## Tweaking camera and lights

- **Camera position / target:** `CameraSetup.jsx` sets `camera.position`, `controls.target`, and `camera.rotation` in a `useEffect`. Tweak these if your new model is framed wrong or clips the circle.
- **OrbitControls** has `enableZoom`, `enablePan`, and `enableRotate` set to `false` so visitors do not drag the view; re-enable if you want interactive orbit.
- **Lights:** Edit intensities and positions in `LightSetup.jsx`. Dark skins may need slightly stronger fill; very bright materials may need dimmer key lights.

---

## Canvas background vs theme

`SceneContainer.jsx` sets the WebGL clear color from `useTheme()` so the 3D background matches Solarized light/dark. If you use a fully opaque model or post-processing, you may still want this to avoid a hard edge against the circular mask.

---

## Hover sound

`UsagiModel.jsx` passes paths into `useAudioHover` (currently `"/usagi_cursor/3uniques.mp3"`). Replace with your own file under `public/`, or remove `onPointerEnter` / `onPointerLeave` and the hook if you do not want sound.

---

## Performance tips

- Keep **GLB** small (meshopt / Draco compression in Blender or gltf-transform helps).
- For large models, consider **`useGLTF.preload('/your.glb')`** during app init (e.g. in the same module as the hero or in a client layout) so the first hero paint does not stall on download. See [Drei useGLTF](https://github.com/pmndrs/drei#usegltf).
- The hero canvas lives in a fixed-size circle; avoid unnecessary **shadow maps** or **post-processing** unless you measure impact.

---

## Dependencies (reference)

Declared in `package.json`: `three`, `@react-three/fiber`, `@react-three/drei`. After major upgrades, check [R3F migration notes](https://docs.pmnd.rs/react-three-fiber) and matching `three` version compatibility.

---

## Further reading

- Project overview: [README.md](../README.md)
- General template wiring (contact, music): [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md)
