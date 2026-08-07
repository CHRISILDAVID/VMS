# Prompts
Design a professional badminton umpire mobile application inspired by official BWF umpire scoring systems, professional tournament officiating software, and modern sports scoring platforms.  GOAL  Create a premium tournament-grade badminton umpire application that allows referees to:  • Configure the starting server and receiver • Start matches • Track live scores • View current player positions • Manage match events • Complete matches  The application should feel:  • Professional • Tournament-grade • Fast • Reliable • Minimal • Focused • Easy to operate under pressure  DESIGN STYLE  • Modern sports officiating interface • Professional BWF-inspired design • Dark navy tournament theme • High contrast scoring UI • Large touch targets • Minimal distractions • Clear visual hierarchy • Premium sports operations feel  COLOR PALETTE  Primary Navy: #0B1F3A Secondary Navy: #102A4C Accent Green: #22C55E Warning Orange: #F59E0B Danger Red: #EF4444 Background: #0F172A Card Background: #1E293B Border: #334155 White Text: #FFFFFF Secondary Text: #CBD5E1  TYPOGRAPHY  • Inter • Satoshi  MOBILE LANDSCAPE REQUIREMENTS  Design specifically for mobile phones in landscape orientation.  Target Devices:  • Android smartphones • 6.5–7 inch displays • Landscape mode only  Reference Resolutions:  • 844 × 390 • 896 × 414 • 932 × 430  The interface should maximize horizontal space and allow referees to operate the entire match using one or two taps.  Requirements:  • Large touch targets • High contrast scoring interface • Fast score updates • Easy operation while seated in umpire chair • Match controls always visible • Minimal navigation • Professional tournament experience  MATCH DATA SOURCE  All match information comes from the Organizer Dashboard.  The organizer already enters:  • Tournament name • Match number • Court number • Match category • Match type • Team names • Player names  The referee should NOT enter:  • Tournament details • Match details • Court details • Team details • Player details  These fields should already be pre-filled.  REFEREE WORKFLOW  Open Match ↓ Select First Server ↓ Select First Receiver ↓ Start Match ↓ Tap Rally Winner ↓ System Handles BWF Logic Automatically ↓ Submit Result  The referee should be able to score an entire match without leaving the Live Match Screen.  MATCH PREPARATION SCREEN  Display:  • Tournament Name • Match Number • Court Number • Category • Match Type  Example:  Tamil Nadu State Championship Court 3 Match M42 Men's Doubles  Display Teams:  TEAM A  Player A1 Player A2  TEAM B  Player B1 Player B2  MATCH INITIALIZATION LOGIC  Before the match starts, the system should already know:  • Serving Team • Receiving Team  These values come from tournament setup or toss outcome.  FIRST SERVER SELECTION  Display:  Select First Server  Only show players from the SERVING TEAM.  Example:  Serving Team A  ○ Player A1 ○ Player A2  FIRST RECEIVER SELECTION  Display:  Select First Receiver  Only show players from the RECEIVING TEAM.  Example:  Receiving Team B  ○ Player B1 ○ Player B2  The application should prevent invalid selections.  INITIAL COURT FORMATION  Generate a visual preview showing:  • First Server • First Receiver • Partner Positions • Service Court • Initial Court Orientation  Use badges:  S = Server R = Receiver  The application must remember these assignments and use them as the starting state for all future service rotations and court position updates.  START MATCH CTA  Large primary button:  START MATCH  LIVE MATCH SCREEN  This is the most important screen.  The referee should conduct the entire match from this screen.  TOP BAR  Display:  • Tournament Name • Court Number • Match Number • Category • Current Game • Match Timer • LIVE Badge  Example:  Court 3 | Match M42 | Game 1  00:24:15  LIVE  CENTER SCOREBOARD  Create a very large professional scoreboard.  Example:  18    -    17  Team A      Team B  Display:  • Current Game • Match Status • Service Indicator  Show:  SERVING  beside the team currently serving.  COURT POSITION VISUALIZATION  Display a badminton court diagram.  IMPORTANT:  Use UMPIRE VIEW orientation.  Do NOT use broadcast TV orientation.  Do NOT place Team A above the net and Team B below the net.  The court should be rotated for landscape mobile devices.  Correct orientation:  TEAM A            | NET |            TEAM B  Player A1         |     |         Player B1 Player A2         |     |         Player B2  The net must be displayed VERTICALLY.  Team A must appear on the LEFT side.  Team B must appear on the RIGHT side.  The court should occupy most of the horizontal screen width.  The court diagram should resemble the perspective seen by an umpire sitting in the umpire chair.  Show:  • Current Server • Current Receiver • Current Player Positions • Service Direction  Use badges:  S = Server R = Receiver  Show clear visual indicators.  PLAYER ROTATION LOGIC  IMPORTANT:  The referee must NOT manually rotate players.  The referee must NOT manually change server or receiver after the match starts.  The application should automatically handle:  • Doubles rotation • Singles rotation • Server changes • Receiver changes • Left court / Right court positions • Service side changes • End changes  AUTOMATIC BADMINTON STATE TRACKING  The application must track individual players, not just teams.  Display:  • Current Server • Current Receiver • Next Server • Next Receiver • Current Service Court • Current Court Positions  The application should automatically update:  • Doubles rotation • Singles rotation • Service changes • Receiver changes • Court side changes • End changes  The referee should never manually calculate rotations.  The referee should only record the winner of each rally.  The system should handle all official badminton positioning logic automatically.  The current server and receiver should always be clearly visible on the court diagram.  SCORING CONTROLS  At the bottom of the screen create two large scoring buttons.  LEFT SIDE  * TEAM A POINT  RIGHT SIDE  * TEAM B POINT  These are the primary actions the referee will use after every rally.  Buttons must be large and highly visible.  MATCH EVENTS PANEL  Create a collapsible side drawer or bottom sheet.  Include:  • Injury Timeout • Yellow Card • Red Card • Official Note • Pause Match • Resume Match • Undo Last Point  Remove:  • Challenges Remaining • Hawk-Eye Reviews • Review Requests  This application is intended for local, academy, district, state, federation and private tournaments.  MATCH TIMELINE  Display a timeline panel.  Show:  • Match Started • Points Scored • Timeouts • Cards Issued • Official Notes  Include timestamps.  GAME MANAGEMENT  Create automatic system banners for:  • 11 Point Interval • Game Point • Match Point • Game Won • Match Won  These should appear prominently during the match.  MATCH COMPLETE SCREEN  Display:  WINNER  Final Match Score  Game Scores  Match Duration  Example:  Winner  Player A1 / Player A2  21-17 18-21 21-14  Duration  57 Minutes  Primary CTA:  SUBMIT RESULT  Secondary CTA:  VIEW MATCH REPORT  UX REQUIREMENTS  • Entire match controlled from one screen • Large touch targets • Fast scoring workflow • Minimal referee effort • Clear visual feedback after every point • Professional sports officiating experience • High visibility in indoor stadium environments • No unnecessary navigation  FIGMA REQUIREMENTS  • Auto Layout • Reusable components • Variants • Mobile landscape layouts • Interactive prototype states • Consistent 8pt spacing system • Production-ready design system • Developer-ready UI  FINAL OUTPUT  Generate a complete professional badminton umpire mobile application including:  • Match Preparation Screen • First Server Selection • First Receiver Selection • Initial Court Formation Preview • Live Match Screen • Automatic Court Position Visualization • Automatic Server/Receiver Tracking • Automatic Doubles Rotation Logic • Match Events Panel • Match Timeline • Match Complete Screen  The final design should feel like a real BWF-inspired tournament officiating application used by referees during live badminton matches while being optimized specifically for mobile landscape devices.
# Response
Now I have everything I need. Building the full professional badminton umpire application across 9 files.

Let me fix a small banner logic issue and also add a needed onClearBanner callback:

Good - the setup is correct. Let me check the tailwind.css to ensure dark mode applies, and verify globals.css:

The app is complete. Let me do a quick final check to make sure there are no import issues:

All 6 component files are in place. The complete professional badminton umpire application is built:

What was implemented:

Match Preparation Screen — pre-filled tournament/court/team data in a dark navy landscape layout with team cards, "serves first" indicator, and match info panel
Setup Flow (3 steps) — server selection → receiver selection → court formation preview with live SVG court diagram updating as the referee makes picks
Live Match Screen — the main officiating screen: giant score numbers (64px), LIVE badge + match timer, BWF-correct court diagram (landscape umpire view, Team A left, Team B right, net vertical), automatic server/receiver tracking via full BWF doubles rotation logic
BWF Doubles Logic — correctly handles: serving team wins (server swaps courts), receiving team wins (service changes, no position change), 11-point interval banner, mid-game end change at 11 in game 3, game point/match point alerts, game transitions, match completion
Events Panel — slide-up sheet for injury timeout, yellow/red cards, pause/resume, undo last point (with history stack)
Match Timeline — collapsible side drawer with timestamped event log
Match Complete Screen — winner trophy, per-game scores, duration, submit/report actions
Suggested next steps:

Wire to a real backend (Supabase) so the organizer dashboard pre-fills live match data
Add haptic feedback for scoring taps (mobile PWA)
Implement a singles match mode with different rotation rules and service court behavior

# Prompt
Modify the existing Badminton Umpire Mobile App prototype. Do NOT redesign the app. Keep the current dark professional tournament-style UI, court visualization, navigation, and scoring flow exactly as they are. Only add the following pre-match setup functionality.

BEFORE a match starts, introduce a mandatory "Match Setup" screen.

MATCH SETUP SCREEN

1. COURT SIDE SELECTION

Add a section called "Court Side Selection".

Allow the umpire to choose which side Team A starts on:

• Left Side
• Right Side

Once Team A is selected, Team B should automatically be assigned the opposite side.

Include a small court preview that visually updates to show the selected team positions.

Store this selection and apply it throughout the match.

2. MATCH FORMAT

Add a section called "Match Format".

Points Per Game:
• 15 Points
• 21 Points (default)
• 30 Points

Number of Sets:
• Best of 1
• Best of 3 (default)

Allow only one selection in each category.

Show a summary card below the selections:

Match Format Summary
• Points Per Game: Selected Value
• Number of Sets: Selected Value
• Team A Starting Side: Selected Value

3. START MATCH BUTTON

Add a prominent "Start Match" button.

When pressed:
• Validate all required selections
• Create the match with the chosen settings
• Navigate to the existing live scoring screen

LIVE MATCH SCREEN UPDATES

Update the existing scoring screen so that:

• Team positions reflect the selected court sides
• The court visualization loads with teams on their chosen starting sides
• Match logic follows the selected points-per-game setting (15, 21, or 30)
• Match logic follows the selected number of sets (Best of 1 or Best of 3)
• Existing scoring, service rotation, and event tracking continue to work normally

MATCH COMPLETE SCREEN

Add the selected match configuration to the final match summary:

• Team A Starting Side
• Team B Starting Side
• Points Per Game
• Number of Sets
• Final Score
• Match Winner

DESIGN REQUIREMENTS

• Maintain the existing visual design and layout language
• Do not replace or redesign current screens
• Create only the additional setup flow and required logic
• Use mobile-first UX patterns
• Include realistic interactions, states, and prototype connections
• Ensure the setup screen feels like a professional tournament umpire application

4. AUTOMATIC COURT SIDE CHANGE

Add automatic court-side switching during a game.

The application should automatically trigger a "Change Ends" event when the match reaches the halfway point of the selected points format.

Rules:

• 15-point game → Change sides when the leading score reaches 8 points
• 21-point game → Change sides when the leading score reaches 11 points
• 30-point game → Change sides when the leading score reaches 15 points

When the threshold is reached:

• Display a full-screen modal or alert:
  "Change Ends"
  "Teams must switch court sides before play continues."

• Pause scoring until the umpire confirms the side change.

• Include a "Confirm Side Change" button.

After confirmation:

• Swap Team A and Team B court positions in the court visualization.
• Update player positions accordingly.
• Continue the match from the current score.
• Log the event in the match timeline/history as:
  "Court sides changed at halftime."

Additional Requirements:

• The side change should occur only once per game.
• The trigger value should automatically depend on the selected points format (15, 21, or 30).
• Ensure all service indicators, player positioning, and court graphics update correctly after the side switch.
• Maintain score, service order, and match state during the transition.
# Response
Let me read the current code thoroughly before making any changes.

Now I have full context. Let me build all the changes systematically.

Now update CourtDiagram to support the teamAOnLeft prop for label swapping:

Now rewrite LiveMatchScreen.tsx with all the new props and change-ends modal integration:

All 6 files are complete. Here's what was added without touching the existing design:

New screen — Match Setup (inserted between Match Prep and Server Selection):

Court Side Selection — animated mini-court preview that live-updates as you pick Left/Right for Team A; Team B auto-assigns the opposite with a confirmation row
Match Format — pill buttons for 15 / 21 (default) / 30 points per game, and Best of 1 / Best of 3 (default); all selections persist
Summary card showing all chosen values including the computed "Change Ends At" threshold (8 / 11 / 15 pts)
Automatic Change Ends flow:

Triggers at 8 / 11 / 15 points (adapts to selected format) — fires exactly once per game
Scoring buttons immediately become disabled
Full-screen ChangeEndsModal shows current scores, describes the rule, previews the new court layout with team colours, and lists each team's old → new side
On "Confirm Side Change" — teamAOnLeft flips, court diagram labels and player positions swap, event logged in timeline as ⇄ Court sides changed at halftime
Live match screen updates:

Top bar now shows Game X of Y (dynamic), {pts}pts pill
Game-point and match-point thresholds use the selected pointsPerGame
Each team panel now shows a sub-label (LEFT SIDE / RIGHT SIDE) that updates after Change Ends
Court diagram labels (TEAM A / TEAM B) flip sides correctly when teamAOnLeft changes
Match Complete screen — new configuration block shows Team A/B starting sides, points per game, and number of sets alongside the final score.


# prompt
Update the umpire scoring screens with the following changes:

### Changes Required

1. After the teams change ends, the bottom scoring controls should also swap sides to match the teams' current court positions. The scoring button for the team on the left side of the court should appear on the left, and the scoring button for the team on the right side of the court should appear on the right. This synchronization should happen automatically whenever the team sides change.

2. \*\*Setup Match Button\*\*

   \* In the \*\*1st frame (Mobile Landscape View)\*\*, the \*\*"Setup Match"\*\* button is not visible.
   \* Reposition the button at the bottom of the screen so it is always visible and easily accessible.

3. \*\*Serving Team Selection\*\*

   \* Do not predefine the serving team.
   \* During match setup, first ask the user to select the \*\*Serving Team (Team 1 or Team 2)\*\*.
   \* After the serving team is selected, display options to choose the \*\*Server\*\* and \*\*Receiver\*\* from the respective teams.

4. \*\*Scoring Controls\*\*

   \* Move the \*\*Undo\*\*, \*\*Pause\*\*, and \*\*Resume\*\* actions directly into the \*\*Scoring\*\* screen.
   \* These controls should always be visible while scoring.
   \* Remove the separate \*\*Events\*\* button, as it is no longer required.

### Design Notes

\* Maintain the existing visual style, spacing, and component consistency.
\* Ensure the updated flow is intuitive and optimized for mobile landscape orientation.
\* Do not redesign unrelated screens or components.
# Response
Let me read the current state of the key files to understand what needs to change precisely.

I have everything in context. Making all 4 changes now in parallel.

All 4 files updated. Here's exactly what changed in each:

MatchPrepScreen.tsx — The "Setup Match" button is removed from the crowded horizontal flex row and placed in its own dedicated bottom bar (full-width, always visible, 44px height) at the bottom of the screen. It can no longer be pushed off-screen regardless of content width.

SetupScreen.tsx — Gains a new Step 1: Select Serving Team (servingTeamSelect phase) at the start of the setup flow. The umpire picks Team A or Team B from large tap-friendly cards that show each team's players. The serving team selection automatically advances to server selection. Step progress indicator grows to 4 steps. The servingTeam prop is now nullable — if not yet selected, the court preview shows a placeholder instead of crashing.

LiveMatchScreen.tsx — Three changes:

Buttons swap sides — leftTeam and rightTeam are derived from teamAOnLeft. When Team A is on the right (teamAOnLeft = false), the left button says "PRADEEP POINT" and the right button says "ARJUN POINT", matching the visual court exactly. Both the label and onScorePoint(team) call update together.
Undo + Pause/Resume inline — the center strip now contains two ControlButtons (↩ UNDO and ⏸ PAUSE / ▶ RESUME) as styled icon buttons, always visible at the bottom of the screen.
Events panel removed — the Settings2 Events button is gone entirely, along with showEvents state and the EventsPanel import.
App.tsx — servingTeamFirst removed from MATCH. New 'servingTeamSelect' phase added to SETUP_PHASES. New SET_SERVING_TEAM action clears server/receiver whenever the serving team changes. onSelectServingTeam in the screen both sets the team and auto-advances to serverSelect. The SetupScreen now receives servingTeam: 'A' | 'B' | null.

# Prompt
Modify ONLY the existing Umpire Dashboard. Do NOT redesign, regenerate, or change any existing UI, functionality, navigation, styling, spacing, colours, typography, animations, or match logic. Keep all existing screens exactly the same.

Make ONLY these changes:

1. LANDSCAPE ONLY
- The Umpire Dashboard should work only in landscape orientation.
- Keep the current landscape UI exactly as it is.
- Do NOT create or optimize a portrait layout.

2. PORTRAIT WARNING
- If the dashboard is opened in portrait mode (mobile/tablet), do NOT show the dashboard.
- Instead, display a clean full-screen message with a rotate-device icon:
  "Please rotate your device to Landscape for the best umpiring experience."
  "Waiting for Landscape Orientation..."
- Automatically return to the existing dashboard when the device is rotated to landscape.
- Desktop behaviour remains unchanged.

3. OPTIONAL SIDE CHANGE
- Side change should no longer be mandatory.
- When the configured side-change score is reached (11/8/15 depending on match format), show a confirmation dialog:
  Title: "Side Change"
  Message: "Would you like to switch court sides?"
  Buttons:
  • Change Sides
  • Continue Without Changing
- If "Change Sides" is selected, execute the current side-change flow exactly as it exists.
- If "Continue Without Changing" is selected, continue the match without changing player positions and without interrupting gameplay again for that interval.

Modify only the necessary files and preserve all existing functionality.
# Response
Let me read the current state of the three files I need to touch.

Three targeted edits only. Starting with ChangeEndsModal.tsx — make the dialog optional with two buttons:

Done. Three files changed, everything else untouched. Here's exactly what was modified:

ChangeEndsModal.tsx — The modal is now an optional choice dialog. Title changed to "Side Change", description to "Would you like to switch court sides?". Two equal-width buttons:

Change Sides (green, primary) — executes the existing side-swap flow
Continue Without Changing (ghost, secondary) — dismisses the dialog and resumes scoring immediately with no side swap and no future interruption for that interval
LiveMatchScreen.tsx — Added onSkipChangeEnds prop to the interface and destructuring, wired as onSkip={onSkipChangeEnds} into ChangeEndsModal. Two-line change.

App.tsx — Three additions:

PortraitWarning component — full-screen #0F172A overlay with an animated rotate-phone SVG icon, the required message text, and a pulsing "Waiting for Landscape Orientation…" status line. It sits above everything at z-index: 9999.
Orientation detection — useState initialised from window.matchMedia('(orientation: portrait)'), useEffect subscribes to change events and unsubscribes on cleanup. Desktop browsers are always landscape so they're unaffected.
SKIP_CHANGE_ENDS action — reducer case sets pendingChangeEnds: false without toggling teamAOnLeft or logging any event, then control returns to the live match screen normally.


# Prompt
Use this prompt:

---

### Mobile Landscape – Match Setup Screen Fix

Modify \*\*only\*\* the \*\*Mobile Landscape Match Setup screen (Step 2 of 4)\*\*.

The primary CTA button \*\*"SELECT SERVERS"\*\* is currently not visible on some mobile landscape devices because the content extends beyond the available viewport height.

\*\*Requirements:\*\*

\* Make the \*\*"SELECT SERVERS"\*\* button fully visible at the bottom of the screen in \*\*mobile landscape view\*\*.
\* Only adjust the \*\*mobile landscape\*\* layout. Do \*\*not\*\* modify the desktop layout, tablet layout, portrait mobile layout, or any other screens.
\* Optimize the layout by reducing unnecessary vertical spacing, tightening margins and paddings, and slightly reducing the height of containers where possible.
\* Keep \*\*all existing components, information, and functionality\*\* exactly as they are. Do not remove, hide, or simplify any content.
\* Preserve the existing visual design, colors, typography, spacing system, and component styles.
\* Ensure the screen fits comfortably within the landscape viewport while keeping the \*\*"SELECT SERVERS"\*\* button immediately accessible without scrolling.
\* Do not introduce any changes outside this specific screen or orientation.

The goal is simply to make the \*\*"SELECT SERVERS"\*\* button visible in the mobile landscape version while leaving every other screen completely unchanged.
# Response
The screenshot makes it clear: the right panel's content stack (section header + points buttons + sets buttons + summary card + CTA) overflows the landscape viewport height, clipping the "SELECT SERVERS" button. I'll inject a targeted @media override for landscape viewports ≤ 450 px tall, leaving the desktop layout pixel-identical.

Done — one file changed, zero other screens touched. Here's exactly what was done:

Strategy — CSS @media override, not inline value changes

A <style> block is injected inside the component scoped to:

@media screen and (max-height: 450px) and (orientation: landscape)
This query matches landscape phones (≈ 390–430 px tall) and nothing else — desktop monitors are always taller than 450 px and portrait is already blocked by the PortraitWarning.

What the media query reduces (landscape mobile only):

Element	Default	Landscape mobile
Top bar height	44 px	36 px
Content padding (py-3)	12 px	6 px
Panel gap	12 px	6 px
Mini court height	110 px	82 px
Points-per-game buttons	44 px	36 px
Sets buttons	40 px	32 px
Court side buttons	46 px	36 px
Summary card padding	10/14 px	6/10 px
Summary row gap	6 px	4 px
Auto-assigned row padding	8/12 px	5/10 px
SELECT SERVERS button	48 px	38 px
Total content column height after reductions: ≈ 310 px, fitting comfortably inside 390 − 36 (topbar) − 12 (padding) = 342 px of usable space. All content, colours, typography and functionality are identical.

