# Demo Scenario Guide - Pune Emergency Corridor

## Demonstration Overview

This scenario demonstrates an emergency ambulance (`MH-12-AMB-042`) traveling along the **Swargate to Ruby Hall Clinic Corridor** in Pune, Maharashtra.

### Demo Coordinates & Junction Sequence

1. **Origin:** Swargate Bus Station (`18.5018, 73.8636`) - Vehicle Starts here.
2. **Junction 1:** Swargate Junction (`18.5018, 73.8636`) - Officer: Inspector Ramesh
3. **Junction 2:** Seven Loves Chowk (`18.5085, 73.8688`) - Officer: Officer Suresh
4. **Junction 3:** Pune Station Chowk (`18.5284, 73.8741`) - Officer: Officer Priya
5. **Junction 4:** Bund Garden Road Junction (`18.5360, 73.8785`) - Officer: Officer Amit
6. **Junction 5:** Ruby Hall Clinic Gate Junction (`18.5395, 73.8820`) - Officer: Officer Deepa
7. **Destination:** Ruby Hall Clinic (`18.5395, 73.8820`)

---

## Step-by-Step Execution Workflow

1. **Open Applications:**
   - Launch Control Room Dashboard (`http://localhost:3000/control-room`) in Main Window.
   - Launch Emergency Vehicle Interface (`http://localhost:3000/emergency`) in a split tab.
   - Launch Traffic Officer Interface (`http://localhost:3000/officer`) in another tab.

2. **Activate Emergency:**
   - In Emergency Vehicle Interface, select vehicle `MH-12-AMB-042`.
   - Click **ACTIVATE EMERGENCY**.
   - Notice instant audio/visual trigger on Control Room & Officer screens.

3. **Officer Acknowledgment & Corridor Clearing:**
   - Upcoming junctions switch to `ALERTED`.
   - Officer Suresh acknowledges alert (**ACKNOWLEDGE ALERT**). Junction status turns `ACKNOWLEDGED`.
   - Officer clears traffic (**MARK JUNCTION CLEAR**). Status turns green (`CLEARED`).

4. **Simulation Step & Arrival:**
   - Click **START SIMULATION** in the Simulation Control Panel.
   - Watch vehicle marker advance along the Pune corridor.
   - ETA and distance remaining update dynamically.
   - As vehicle passes each junction, status updates to `PASSED`.
   - Upon reaching Ruby Hall Clinic, emergency trip automatically completes!
