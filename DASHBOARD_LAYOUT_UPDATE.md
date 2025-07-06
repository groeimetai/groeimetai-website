# Dashboard Layout Update

## Overview
The dashboard layout has been redesigned to have a fixed top row for the primary widgets (Project Timeline/Progress and Messages), with all other widgets positioned below.

## Layout Structure

### Top Row (Fixed)
- **2 columns** on desktop, **1 column** on mobile
- **User Dashboard**: Project Timeline + Messages & Communication
- **Admin Dashboard**: All Projects + Client Communications
- These widgets:
  - Always occupy the full width of their container
  - Have a minimum height of 450px
  - Cannot be moved, removed, or resized
  - No expand/minimize buttons

### Lower Grid (Customizable)
- **4 columns** on desktop, **2 columns** on tablet, **1 column** on mobile
- Contains all other widgets (Quick Actions, Documents, etc.)
- These widgets:
  - Can be added/removed
  - Can be reordered (drag & drop in edit mode)
  - Can be expanded to full width
  - Have expand/minimize buttons

## Technical Implementation

### Widget Separation
```javascript
const topWidgetTypes = isAdmin ? ['projectProgress', 'messages'] : ['projectTimeline', 'messages'];
const topWidgets = widgets.filter(w => topWidgetTypes.includes(w.type));
const otherWidgets = widgets.filter(w => !topWidgetTypes.includes(w.type));
```

### Render Logic
- Top widgets are rendered in a separate grid container
- `renderWidget()` function accepts an `isTopWidget` parameter
- Top widgets have special styling and behavior

### Edit Mode
- Top widgets are shown with reduced opacity and disabled interactions
- Only lower grid widgets can be dragged and reordered
- When saving, top widgets maintain their fixed positions

## Benefits
1. **Consistency**: Primary information always visible in the same location
2. **Hierarchy**: Clear visual importance of project status and communications
3. **Flexibility**: Secondary widgets can still be customized
4. **Responsive**: Maintains good layout on all screen sizes

## Widget Positions
The position system has been updated:
- Top widgets: `y: 0` (row 0)
- Other widgets: `y: 1` (row 1)
- X position determines column placement within each row