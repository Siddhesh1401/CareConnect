# 🚀 CareConnect Development Best Practices

## API Request Guidelines

### ✅ DO THIS:
- Use the existing `api.ts` service for ALL API calls
- Let the system handle deduplication automatically
- Add loading states with proper error handling
- Test with rapid clicking/navigation

### ❌ DON'T DO THIS:
- Create new axios instances
- Make direct fetch() calls
- Bypass the API service
- Forget error boundaries

## Code Patterns

### Loading States (GOOD):
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/endpoint');
      // Handle success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Error Boundaries (GOOD):
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error);
    // Log to monitoring service
  }
}
```

## Testing Checklist

### Before Deploying New Features:
- [ ] Test rapid page switching
- [ ] Test with slow network (Chrome DevTools)
- [ ] Test page refresh during loading
- [ ] Check console for deduplication logs
- [ ] Verify no stuck loading states
- [ ] Test error scenarios

## Monitoring

### Watch For:
- `🐌 Slow API call` warnings (>2 seconds)
- Missing deduplication logs
- CORS errors
- 429 rate limit errors
- Stuck loading states

## Quick Fixes

### If you see stuck loading:
1. Check if backend is running
2. Verify CORS configuration
3. Look for missing error handling
4. Test with network throttling

### If you see CORS errors:
1. Check backend CORS origins
2. Verify preflight handling
3. Test OPTIONS requests

Remember: The API service handles 90% of potential issues automatically!