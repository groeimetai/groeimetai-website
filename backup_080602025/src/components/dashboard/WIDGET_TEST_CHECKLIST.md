# Dashboard Widget Persistence Test Checklist

## Test Scenarios

### 1. Initial Load

- [ ] Dashboard loads with role-appropriate default widgets
- [ ] Admin users see admin-specific widgets (Business Metrics, Client Communications, etc.)
- [ ] Regular users see user-specific widgets (Project Timeline, Messages, etc.)
- [ ] Loading spinner appears while fetching preferences

### 2. Widget Customization

- [ ] Click "Customize" button to enter edit mode
- [ ] Original widget state is preserved
- [ ] "Unsaved changes" indicator appears when modifications are made
- [ ] Cancel button prompts for confirmation if there are unsaved changes
- [ ] Cancel restores original widget layout without reloading from database

### 3. Add/Remove Widgets

- [ ] "Add Widget" button opens dialog with available widgets
- [ ] Role-specific widgets are properly filtered (adminOnly/userOnly)
- [ ] Already added widgets show "Added" badge and are disabled
- [ ] New widgets can be added successfully
- [ ] Widgets can be removed with the X button in edit mode

### 4. Drag and Drop Reordering

- [ ] Widgets can be dragged to reorder
- [ ] Visual feedback during drag (opacity change)
- [ ] Positions update correctly after drop
- [ ] "Unsaved changes" indicator appears after reordering

### 5. Widget Expansion

- [ ] Expand/collapse button works for each widget
- [ ] In edit mode: changes are tracked as unsaved
- [ ] Outside edit mode: changes auto-save immediately
- [ ] Expansion state persists across reloads

### 6. Save Functionality

- [ ] Save button is disabled when no changes
- [ ] Save button shows "Saved" after successful save
- [ ] Success toast appears: "Dashboard saved successfully"
- [ ] Error handling shows appropriate toast on failure
- [ ] Edit mode exits automatically after successful save

### 7. Reset to Default

- [ ] Reset button shows confirmation dialog
- [ ] Resetting updates widgets to role-based defaults
- [ ] Info toast appears: "Dashboard reset to default. Save to apply changes."
- [ ] Changes must be saved to persist

### 8. Persistence Across Sessions

- [ ] Reload page - custom layout persists
- [ ] Log out and back in - custom layout persists
- [ ] Different browsers/devices - layout syncs correctly
- [ ] Error recovery - defaults load if preferences are corrupted

### 9. Error Handling

- [ ] Network errors show appropriate toast messages
- [ ] Missing user profile handled gracefully
- [ ] Firestore permission errors handled
- [ ] Page doesn't break on errors - defaults are used

### 10. Browser Navigation

- [ ] Warning appears when leaving page with unsaved changes
- [ ] No warning when no unsaved changes exist

## Implementation Details Fixed

1. **loadWidgetPreferences function scope** - Moved outside useEffect for reusability
2. **Original state tracking** - Added originalWidgets state to restore on cancel
3. **Error handling** - Added toast notifications for all error cases
4. **Auto-save on exit** - Edit mode exit triggers save automatically
5. **TypeScript errors** - Fixed all type issues
6. **Persistence flow** - Widgets save to user document in Firestore
