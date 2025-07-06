# Docker Build Fix

## Issue

The Docker build in CI/CD was failing with a TypeScript error that was already fixed locally:

```
Type error: This expression is not callable.
  Type 'QueryDocumentSnapshot<DocumentData, DocumentData>' has no call signatures.
```

## Root Cause

The Docker build was using a cached version of the code, even though the fix was already committed and pushed. The error showed line numbers that didn't match the current code.

## Solution

1. Verified that TypeScript compilation passes locally with `npm run typecheck`
2. Verified that the build passes locally with `npm run build`
3. Added a comment to force Docker to rebuild with the latest code
4. Pushed the change to trigger a fresh build

## If Issue Persists

If the Docker build still fails with the same error:

1. **Clear Docker cache in GitHub Actions**:
   Add `--no-cache` flag to the docker build command in `.github/workflows/ci-cd.yml`:

   ```yaml
   - name: Build Docker image
     run: docker build --no-cache -t ${{ env.IMAGE_NAME }} .
   ```

2. **Use a cache-busting build argument**:

   ```yaml
   - name: Build Docker image
     run: docker build --build-arg CACHEBUST=$(date +%s) -t ${{ env.IMAGE_NAME }} .
   ```

3. **Check if the runner is pulling the latest code**:
   Ensure the checkout action is getting the latest commit:
   ```yaml
   - uses: actions/checkout@v4
     with:
       fetch-depth: 0
   ```

## Prevention

To prevent this in the future:

- Consider adding a step to log the git commit hash in the Docker build
- Use semantic versioning for Docker images
- Implement a cache invalidation strategy for CI/CD builds
