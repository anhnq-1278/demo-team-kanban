# Feature Specification: Team Kanban Board

**Feature Branch**: `001-team-kanban-board`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Kanban board cho nhóm nhỏ — Board, Column/List, Card (task), kéo–thả để đổi trạng thái, comment và gán người phụ trách, Activity Log cơ bản."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Board & Card Management (Priority: P1)

A team member opens the app for the first time. They create a new Board named "Sprint 1". The board appears
with three default columns: **To Do**, **In Progress**, and **Done**. The member adds several Cards (tasks)
to the "To Do" column by typing a title. Each Card can be opened to add a description. All data persists
when the browser tab is closed and reopened.

**Why this priority**: Without the ability to create a board and add cards, the app delivers zero value.
This story covers the foundational CRUD loop for the core entities.

**Independent Test**: Create a new board, add 3 cards to "To Do", close and reopen the browser tab —
all boards and cards must still be present and unchanged.

**Acceptance Scenarios**:

1. **Given** no boards exist, **When** a user enters a board name and confirms, **Then** a new board is created with three columns (To Do, In Progress, Done) and appears in the board list.
2. **Given** a board is open, **When** a user types a card title and submits in a column, **Then** the card appears at the bottom of that column.
3. **Given** a card exists, **When** a user opens it and enters a description, **Then** the description is saved and displayed when the card is reopened.
4. **Given** a board or card exists, **When** a user renames or deletes it, **Then** the change is reflected immediately and persisted across page reloads.
5. **Given** existing boards and cards, **When** the browser tab is closed and reopened, **Then** all data is restored exactly as it was.

---

### User Story 2 — Drag-and-Drop Status Transitions (Priority: P2)

A team member views the board and drags a card from "To Do" into "In Progress" to signal they have started
working on it. Later they drag it to "Done". The card's new position is saved. Another member refreshes the
page and sees the updated status.

**Why this priority**: Moving cards between columns is the primary day-to-day interaction of a Kanban board.
Without it, status management would require error-prone manual editing.

**Independent Test**: Drag a card from column A to column B — the card appears in column B after release
and remains there after a page reload.

**Acceptance Scenarios**:

1. **Given** a card is in "To Do", **When** a user drags-and-drops it onto "In Progress", **Then** the card moves to "In Progress" and its previous column no longer shows it.
2. **Given** a card is dropped into a column with other cards, **When** the drop position is between two existing cards, **Then** the card is inserted at that position and the order persists after reload.
3. **Given** a user on a touch screen (tablet), **When** they long-press and drag a card, **Then** the drag-and-drop works the same as on desktop.
4. **Given** a drag operation is in progress, **When** the user releases the card over an invalid area (outside any column), **Then** the card returns to its original position unchanged.

---

### User Story 3 — Assign a Member to a Card (Priority: P3)

A team member opens a card and assigns it to a colleague by selecting from a list of member names associated
with the board. The assignee's name is displayed on the card face (visible without opening the card). Any
member can change or clear the assignment.

**Why this priority**: Accountability is a core team collaboration need. Seeing who owns a task at a glance
eliminates ambiguity without requiring a meeting.

**Independent Test**: Assign a card to a member — the member name appears on the card in the column view,
and remains after page reload.

**Acceptance Scenarios**:

1. **Given** a board has a member list, **When** a user opens a card and selects a member as assignee, **Then** the member's name is saved and displayed on the card face.
2. **Given** a card has an assignee, **When** a user changes the assignee to a different member, **Then** the card face updates immediately and the change is recorded in the Activity Log.
3. **Given** a card has an assignee, **When** a user clears the assignment, **Then** no assignee name is displayed on the card face.
4. **Given** a board, **When** a user adds or removes members from the board's member list, **Then** the assignee options on all cards in that board reflect the change.

---

### User Story 4 — Comment on a Card (Priority: P4)

A team member opens a card and leaves a comment (plain text) to provide context or ask a question. Other
members can see all comments in chronological order within the card detail view. Comments show the author
name and timestamp.

**Why this priority**: Comments are the primary async communication channel around a task. They reduce
context-switching to external tools for short-form discussion.

**Independent Test**: Post a comment on a card — the comment appears with author name and timestamp;
it is still present after page reload.

**Acceptance Scenarios**:

1. **Given** a card is open, **When** a member types a comment and submits it, **Then** the comment appears in the card's comment list with the author's name and a human-readable timestamp.
2. **Given** multiple comments exist on a card, **When** the card is opened, **Then** comments are displayed in ascending chronological order (oldest first).
3. **Given** an empty comment field, **When** a user attempts to submit, **Then** the submit action is prevented and no empty comment is created.
4. **Given** a comment exists, **When** the page is reloaded, **Then** all comments are still present and unchanged.

---

### User Story 5 — Activity Log (Priority: P5)

A team member opens a board's Activity Log panel and sees a reverse-chronological list of significant events:
cards moved between columns, assignee changes, and new comments. Each entry shows what happened, which card
was affected, who did it, and when.

**Why this priority**: The log gives the team a lightweight audit trail and situational awareness without
requiring real-time presence.

**Independent Test**: Perform a status transition, an assignment change, and post a comment — all three
events appear as distinct entries in the Activity Log with correct details.

**Acceptance Scenarios**:

1. **Given** a card is moved between columns, **When** a user checks the Activity Log, **Then** an entry records: actor, action ("moved"), card title, source column, destination column, and timestamp.
2. **Given** a card's assignee is changed, **When** a user checks the Activity Log, **Then** an entry records: actor, action ("assigned"), card title, new assignee, and timestamp.
3. **Given** a comment is posted, **When** a user checks the Activity Log, **Then** an entry records: actor, action ("commented"), card title, and timestamp (comment text is NOT duplicated in the log).
4. **Given** many events have occurred, **When** the Activity Log is opened, **Then** entries are displayed newest-first.
5. **Given** no activity has occurred on a board, **When** the Activity Log is opened, **Then** an empty-state message is shown.

---

### Edge Cases

- **Empty board**: A board with no cards in any column must display correctly and allow card creation.
- **Single card in column**: Dragging the only card out of a column leaves the column empty with a visible drop zone.
- **Long card titles**: Titles exceeding 80 characters must be truncated with an ellipsis on the card face; the full title is visible inside the card detail view.
- **Long comment text**: Comments exceeding the visible area must scroll within the comment list, not overflow the card detail panel.
- **Member deleted from board**: If a member is removed from the board's member list, cards already assigned to that person retain the name as plain text (no broken reference), but that name is no longer selectable for new assignments.
- **Simultaneous tabs**: If the app is open in two tabs and a change is made in one, a page reload of the other tab must reflect the latest state (eventual consistency via reload is acceptable; live sync is out of scope).
- **Storage full**: If the browser's storage quota is exceeded, the user must see an error message explaining that data could not be saved; no silent failure.

## Requirements *(mandatory)*

### Functional Requirements

**Board Management**

- **FR-001**: Users MUST be able to create a Board by providing a name; the board is immediately accessible and persisted.
- **FR-002**: Users MUST be able to rename and delete a Board; deleting a Board removes all its Columns, Cards, comments, and Activity Log entries.
- **FR-003**: Users MUST be able to add named members to a Board; a member is a display name with no password or authentication required.

**Column Management**

- **FR-004**: Every new Board MUST be initialized with three Columns in order: **To Do**, **In Progress**, **Done**.
- **FR-005**: Users MUST be able to rename a Column.
- **FR-006**: Users MUST be able to add additional Columns to a Board beyond the default three.
- **FR-007**: Deleting a Column MUST also delete all Cards within it.

**Card Management**

- **FR-008**: Users MUST be able to create a Card in any Column by providing at minimum a title.
- **FR-009**: Users MUST be able to edit a Card's title and description after creation.
- **FR-010**: Users MUST be able to delete a Card, removing it and all its comments from storage.
- **FR-011**: Card order within a Column MUST be preserved across page reloads.

**Drag-and-Drop**

- **FR-012**: Users MUST be able to move a Card to a different Column by dragging and dropping it; the move is persisted immediately.
- **FR-013**: Users MUST be able to reorder Cards within the same Column by dragging; the new order is persisted.
- **FR-014**: Drag-and-drop MUST function on both mouse (desktop) and touch (tablet) input without additional settings.
- **FR-015**: If a Card is dropped outside a valid Column, it MUST return to its original position.

**Assignment**

- **FR-016**: Users MUST be able to assign one member (from the Board's member list) to a Card; only one assignee per Card is allowed.
- **FR-017**: Users MUST be able to clear the assignee of a Card.
- **FR-018**: The assignee's name MUST be visible on the Card face in the column view (no need to open the card).
- **FR-019**: Changing the assignee MUST produce an Activity Log entry.

**Comments**

- **FR-020**: Users MUST be able to post plain-text comments on a Card; each comment records the author name and timestamp.
- **FR-021**: Comments MUST be displayed in ascending chronological order within the Card detail view.
- **FR-022**: An empty comment MUST NOT be submittable.
- **FR-023**: Posting a comment MUST produce an Activity Log entry.

**Activity Log**

- **FR-024**: The Activity Log MUST record the following event types: Card moved between Columns, Card assignee changed, Comment posted.
- **FR-025**: Each Activity Log entry MUST contain: timestamp (ISO 8601), actor display name, event type, affected Card title, and relevant detail (e.g., column names for a move).
- **FR-026**: The Activity Log MUST be scoped per Board and displayed newest-first.
- **FR-027**: Activity Log entries MUST persist across page reloads.

**Persistence**

- **FR-028**: All data (Boards, Columns, Cards, comments, Activity Log) MUST be stored client-side and survive browser tab close/reopen without any network request.
- **FR-029**: If storage save fails, the user MUST see an error notification; the UI MUST NOT silently discard data.

### Key Entities

- **Board**: Top-level workspace. Has a name, an ordered list of Columns, and a member list (display names). Contains its own Activity Log.
- **Column**: An ordered list of Cards within a Board. Has a name. Default names: "To Do", "In Progress", "Done".
- **Card**: A task item within a Column. Has a title, optional description, optional single assignee (member name), an ordered list of Comments, and a position index.
- **Comment**: Text attached to a Card. Has body text, author name, and creation timestamp.
- **ActivityEntry**: An event record attached to a Board. Has timestamp, actor name, event type, card title reference, and event detail string.
- **Member**: A display name registered on a Board. Not a user account — no password or authentication. Used for assignment and as the actor identity in comments and Activity Log entries.

## Assumptions

- **No authentication**: The app has no login system. Any person with access to the browser can act as any member. The "current user" is set by selecting an active member name from the Board's member list before acting.
- **Single board per session**: The UI shows a board list; the user selects one board to work in at a time. Multiple boards can exist in storage.
- **Data isolation**: Data is local to the browser. There is no sync between different users' browsers or devices.
- **Column limit**: A Board may have up to 10 columns (reasonable UX limit; not a hard technical constraint).
- **Member limit**: A Board may have up to 20 named members.
- **Activity Log retention**: All entries are retained indefinitely within localStorage (no auto-expiry).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create a board, add 5 cards across 3 columns, assign members, and move cards between columns — all within 5 minutes, with no instructions.
- **SC-002**: All board and card data (including comments and activity log) survives a full browser tab close and reopen with zero data loss in 100% of test runs.
- **SC-003**: A card can be dragged between columns and the move is visually confirmed and persisted within 1 second of the drop.
- **SC-004**: The Activity Log accurately reflects every status transition, assignment change, and comment post with correct actor, timestamp, and detail in 100% of tested interactions.
- **SC-005**: The application loads and is fully interactive within 2 seconds on a standard broadband connection.
- **SC-006**: All primary interactions (create card, move card, assign member, post comment) are completable using keyboard navigation alone, with no mouse required.
