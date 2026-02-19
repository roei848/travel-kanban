# Design: Add New Task Button

**Date:** 2026-02-19
**Status:** Approved

## Summary

Add a board-level button that opens a creation modal for new tasks. New tasks always land in the backlog column. The modal mirrors the existing edit modal's look and feel.

## Components & Files

| File | Change |
|---|---|
| `kanban/src/firebase/tasks.js` | Add `addTask(fields)` — calls `addDoc` with `status: 'backlog'`, `order: Date.now()` |
| `kanban/src/components/Board.jsx` | Add `+ משימה חדשה` button in header; manage `showCreate` state; render `<CreateTaskModal>` |
| `kanban/src/components/CreateTaskModal.jsx` | New component — mirrors TaskModal layout and styling |

## CreateTaskModal Fields

| Field | Input type | Default |
|---|---|---|
| כותרת (title) | text input | `''` (required) |
| הוראות נוספות (description) | textarea | `''` |
| קטגוריה (category) | text input | `'general'` |
| סוג (type) | select — FE / BE / BE+FE | `'FE'` |
| עדיפות (priority) | select | `'low'` |
| משויך ל (assignee) | button group | none |

Status is always `'backlog'` — not shown to the user.

## Data Flow

1. User clicks `+ משימה חדשה` in Board header
2. `showCreate` state set to `true`, `<CreateTaskModal>` mounts
3. User fills fields → clicks "צור משימה"
4. `addTask({ title, description, category, type, priority, assigneeId, status: 'backlog', order: Date.now() })` called
5. Firestore `onSnapshot` fires → task appears in backlog column automatically
6. Modal closes

## Approach

Separate `CreateTaskModal` component (not extending the existing `TaskModal`). The two modals differ in intent: creation has editable category/type inputs, while editing shows them as read-only badges. Keeping them separate avoids conditional logic and lets each evolve independently.
