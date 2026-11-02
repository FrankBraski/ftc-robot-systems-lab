# Robot Systems Lab

Interactive tutorials for FIRST Tech Challenge students, in a single web page.

**Open it:** https://frankbraski.github.io/ftc-robot-systems-lab/

## Modules

| # | Module | Interactive tool |
|---|--------|------------------|
| 01 | Chassis | Tip-over (center of gravity) tester |
| 02 | Drivetrain | Mecanum wheel explorer, drive speed calculator |
| 03 | Intake | Pick-the-intake exercise |
| 04 | Shooter | Flywheel trajectory lab |
| 05 | Autonomous | Put-the-routine-in-order exercise |
| 06 | Starting Positions | Red/Blue × Position 1/2 planner with path mirroring |
| 07 | Computer Vision | Camera exposure tuner |
| 08 | AprilTags | Range / bearing / yaw explorer with drive-to-tag |

Each module ends with a short quiz. Progress is saved in the student's browser.

## Class progress tracking (optional)

Teachers can turn on **Sign in with Google**. Each student's progress then saves to a Google Sheet
the teacher owns, and a **Class dashboard** on the site shows who has finished what. Setup is a one-time,
roughly 15-minute task: see [SETUP.md](SETUP.md). The backend is a short Google Apps Script in
[`apps-script/Code.gs`](apps-script/Code.gs). No servers or paid services.

## Notes

- Code samples use the FTC SDK in Java. Confirm signs and tuning values on your own robot with telemetry.
- Field drawings are generic examples. Always check the current season's Game Manual for starting tiles, goals, and AprilTag IDs.
- Not an official FIRST resource.

## Run locally

Download `index.html` and open it in any modern browser. No build step.
