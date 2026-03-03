# Integration Tests for CRUD Workflows

This directory contains integration tests for complete CRUD (Create, Read, Update, Delete) workflows across all modules in the application.

## Important Note

These integration tests are **templates** that demonstrate the testing approach for CRUD workflows. They may need adjustments based on the actual implementation of each module:

- Some pages may not exist yet (Users create/edit pages, Permissions pages, Audit pages)
- Component structures may differ from what the tests expect
- API responses may have different shapes
- UI elements may have different labels or attributes

**Before running these tests**, ensure that:

1. The corresponding pages and components exist
2. The API mocks match the actual API structure
3. The UI element selectors match the actual implementation
4. All required dependencies are installed

## Test Coverage

### Completed Integration Tests

1. **Roles CRUD** (`roles-crud.test.tsx`)
   - Complete workflow: list → create → edit → delete
   - List view with pagination, sorting, and filtering
   - Create flow with validation
   - Edit flow with pre-filled data
   - Delete flow with confirmation and constraint handling
   - Error handling for all operations
   - Validates: Requirements 2.1-2.8, 14.2

2. **Profiles CRUD** (`profiles-crud.test.tsx`)
   - Complete workflow: list → create → edit → delete
   - List view with user count display
   - Create flow with duplicate label handling
   - Edit flow with pre-filled data
   - Delete flow with foreign key constraint handling
   - Error handling for all operations
   - Validates: Requirements 3.1-3.8, 14.2

3. **Employment Status CRUD** (`employment-status-crud.test.tsx`)
   - Complete workflow: list → create → edit → delete
   - List view with user count display
   - Create flow with validation
   - Edit flow with pre-filled data
   - Delete flow with prevention when status is in use
   - Error handling for all operations
   - Validates: Requirements 4.1-4.7, 14.2

4. **Users CRUD** (`users-crud.test.tsx`)
   - Complete workflow: list → create → edit → delete
   - List view with profile and employment status display
   - Filtering by profile and employment status
   - Search functionality
   - Delete flow with confirmation
   - Display of user information (photos, emails, usernames)
   - Navigation to create and edit pages
   - Error handling for all operations
   - Validates: Requirements 1.1-1.10, 14.2

### Pending Integration Tests

The following modules still need integration tests:

5. **Permissions CRUD**
   - List view with grouping by resource
   - Create/edit with ABAC conditions (JSON editor)
   - Permission assignment to roles
   - Validates: Requirements 5.1-5.10

6. **Audit Logs**
   - List view with filtering
   - Detail view modal
   - Statistics display
   - CSV export functionality
   - Validates: Requirements 6.1-6.8

## Test Structure

Each integration test file follows this structure:

### 1. Complete CRUD Flow Test

Tests the entire workflow from start to finish:

- View list of items
- Create a new item
- Edit the newly created item
- Delete the item
- Verify list updates after each operation

### 2. Individual Operation Tests

#### List View Tests

- Display all items
- Pagination
- Sorting
- Filtering/Search
- Empty state handling

#### Create Flow Tests

- Successful creation
- Validation errors
- Duplicate handling
- Form submission

#### Edit Flow Tests

- Successful update
- Pre-filled form data
- Validation errors
- Form submission

#### Delete Flow Tests

- Successful deletion
- Confirmation modal
- Cancel deletion
- Constraint handling (foreign keys)

#### Error Handling Tests

- Network errors
- API errors
- Validation errors
- Constraint violations

## Running the Tests

### Run all integration tests

```bash
npm test -- src/__tests__/integration
```

### Run specific module tests

```bash
npm test -- src/__tests__/integration/roles-crud.test.tsx
npm test -- src/__tests__/integration/profiles-crud.test.tsx
npm test -- src/__tests__/integration/employment-status-crud.test.tsx
npm test -- src/__tests__/integration/users-crud.test.tsx
```

### Run with coverage

```bash
npm run test:coverage -- src/__tests__/integration
```

### Run in watch mode

```bash
npm run test:watch -- src/__tests__/integration
```

## Test Patterns

### Mocking APIs

All tests mock the API layer using Jest mocks:

```typescript
jest.mock('@/lib/api/roles');
(rolesAPI.getAll as jest.Mock).mockResolvedValue({ data: mockData });
```

### User Interactions

Tests use `@testing-library/user-event` for realistic user interactions:

```typescript
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
```

### Waiting for Async Operations

Tests use `waitFor` to handle async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Test Wrappers

All tests wrap components with necessary providers:

```typescript
const TestWrapper = ({ children }) => (
  <PermissionProvider>
    <ToastProvider>{children}</ToastProvider>
  </PermissionProvider>
);
```

## Best Practices

1. **Test User Flows**: Focus on complete user workflows rather than isolated component behavior
2. **Mock External Dependencies**: Mock API calls, navigation, and external libraries
3. **Use Realistic Data**: Use data structures that match the actual API responses
4. **Test Error Cases**: Include tests for error handling and edge cases
5. **Verify Side Effects**: Check that operations trigger expected side effects (API calls, list refreshes, etc.)
6. **Clean Up**: Use `beforeEach` to reset mocks and state between tests

## Notes

- These tests focus on integration between components and user interactions
- They do not test the actual API implementation (that's covered by API tests)
- They verify that the UI correctly handles API responses and errors
- They ensure that CRUD workflows work end-to-end from the user's perspective

## Related Documentation

- [Testing Strategy](../../docs/TESTING_STRATEGY.md)
- [Requirements Document](.kiro/specs/frontend-backend-sync/requirements.md)
- [Design Document](.kiro/specs/frontend-backend-sync/design.md)
- [Tasks Document](.kiro/specs/frontend-backend-sync/tasks.md)
