# Three.js camera gizmo

## What I have here
A React.js + Three.js app with a basic 3D scene and a **rotation camera gizmo**. Basically a lab to help me develop the camera gizmo.

All the gizmo logic is in `src/core.ts`, and how to use it in `src/App.tsx`.

## What is the goal
Creating a camera gizmo to rotate the scene to different views (front, back, right, left, top, down). This will become a npm package to be used in any scene. If it's used with a framework like React, Angular, Vue, etc. or vanilla JS, it'll work just fine.

## What is the current status
I have isolated all the logic of creation and configuration of the gizmo for any given scene, created some life-cycle functions, and it's working for mouse and touch inputs. I need to do some final tweakings and then I'll create a separate repository where I'll configure all the transpiling thing of the npm package.
