# Step Master Ordering System Migration

## Evolution

### Phase 1: Unique Index (Original Problem)
- Used `order_index` with UNIQUE constraint
- Caused conflicts when reordering (intermediate updates violated constraint)

### Phase 2: Linked List (Temporary Solution)
- Added `next_step_id` column for linked list structure
- Removed UNIQUE constraint
- Worked but was complex for queries and maintenance

### Phase 3: Fractional Ordering (Current Solution)
- Uses `order_index` as NUMERIC(20, 10) without UNIQUE constraint
- Steps are spaced with gaps (1000, 2000, 3000, etc.)
- Allows efficient reordering and insertion without conflicts

## Current Implementation

### 1. Database Schema
- `order_index` is NUMERIC(20, 10) - allows fractional values
- No UNIQUE constraint - gaps and duplicates are fine
- Steps ordered by `order_index ASC`
- Initial values: 1000, 2000, 3000, etc. (gaps of 1000)

### 2. API Behavior

#### `/api/steps/reorder` (PUT)
- Assigns new order values with gaps: (index + 1) * 1000
- Example: [1000, 2000, 3000, 4000]
- No conflicts since no unique constraint

#### `/api/steps` (POST)
- Finds max order_index
- Adds new step at max + 1000
- Always appends to the end

#### `/api/steps/[id]` (PATCH)
- Updates step properties only
- Order changes only via reorder endpoint

#### `/api/steps/[id]` (DELETE)
- Simply deletes the step
- No need to update other steps (gaps are fine)

### 3. RPC Function
- `complete_step()` finds next step using `order_index > current_order`
- Orders by `order_index ASC` and takes first result

### 4. Frontend
- Drag and drop to reorder
- Shows unsaved changes banner
- Save/Cancel buttons for batch updates
- Visual drop indicator line

## Benefits
1. **No unique constraint conflicts** - Can update multiple steps simultaneously
2. **Simple queries** - Just ORDER BY order_index
3. **Efficient reordering** - Single pass update with gaps
4. **Future-proof** - Can insert between steps using midpoint if needed
5. **Clean deletes** - No cascade updates required

## Future Enhancement: Midpoint Insertion
If needed, can insert between steps using midpoint:
- Between 1000 and 2000 → insert at 1500
- Between 1500 and 2000 → insert at 1750
- Allows unlimited insertions without full reorder

## Testing
Test the following scenarios:
1. Drag and drop to reorder steps multiple times before saving
2. Edit a step's properties (name, roles, etc.)
3. Create a new step (should append at end)
4. Delete a step from the middle of the list
5. Complete a step and verify next step becomes pending
6. Save reordered steps and verify persistence
