# Feature Rollout Plan

This project is now anchored on the minimal stable build. The goal is to reintroduce features in small, verifiable checkpoints so we always know what broke.

## Checkpoints

1. Baseline stability
   - Verify login, clock in/out, camera, report submit.
   - Confirm no crash on launch in TestFlight.
2. Reports enhancements
   - Re-add legacy report UI.
   - Validate report upload, images, and timestamps.
3. Shifts
   - Re-add shift views and completed shift history.
4. Settings
   - Re-add profile/settings edit flow.
5. Dashboard and Home
   - Reintroduce full dashboard navigation and cards.

## How to Enable Features

Feature flags live in `config/featureFlags.js`. Toggle only one area at a time, then build and test on device.

## Rule of Thumb

If a checkpoint fails, revert the most recent change and re-test the previous checkpoint. Keep changesets small and focused.
