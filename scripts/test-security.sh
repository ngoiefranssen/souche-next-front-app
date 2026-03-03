#!/bin/bash

# Security Testing Script
# This script performs basic security checks on the frontend application

# Don't exit on error - we want to see all test results
# set -e

echo "🔒 Frontend Security Testing"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "ℹ $1"
}

# Check if file exists
check_file() {
    if [ -f "$1" ]; then
        pass "File exists: $1"
        return 0
    else
        fail "File missing: $1"
        return 1
    fi
}

# Check if string exists in file
check_string_in_file() {
    if grep -q "$2" "$1" 2>/dev/null; then
        pass "Found '$2' in $1"
        return 0
    else
        fail "Missing '$2' in $1"
        return 1
    fi
}

# Check for sensitive data in files
check_no_sensitive_data() {
    local file=$1
    local patterns=("password.*=.*['\"]" "token.*=.*['\"]" "secret.*=.*['\"]" "api_key.*=.*['\"]")
    
    for pattern in "${patterns[@]}"; do
        if grep -iE "$pattern" "$file" 2>/dev/null | grep -v "REDACTED" | grep -v "example" | grep -v "placeholder" > /dev/null; then
            fail "Potential sensitive data in $file: $pattern"
            return 1
        fi
    done
    
    pass "No sensitive data found in $file"
    return 0
}

echo "1. Checking Security Files"
echo "----------------------------"
check_file "src/utils/auth/tokenManager.ts"
check_file "src/utils/auth/tokenRefresh.ts"
check_file "src/utils/auth/csrfProtection.ts"
check_file "src/utils/auth/sessionTimeout.ts"
check_file "src/lib/utils/secureLogger.ts"
check_file "src/components/CsrfInitializer.tsx"
check_file "src/app/api/csrf/route.ts"
echo ""

echo "2. Checking JWT Token Management"
echo "----------------------------------"
check_string_in_file "src/utils/auth/tokenManager.ts" "SameSite=Lax"
check_string_in_file "src/utils/auth/tokenManager.ts" "Secure"
check_string_in_file "src/lib/api/client.ts" "Authorization"
check_string_in_file "src/lib/api/client.ts" "Bearer"
echo ""

echo "3. Checking Token Refresh"
echo "--------------------------"
check_string_in_file "src/utils/auth/tokenRefresh.ts" "refreshToken"
check_string_in_file "src/utils/auth/tokenRefresh.ts" "scheduleTokenRefresh"
check_string_in_file "src/utils/auth/tokenRefresh.ts" "handleRefreshFailure"
check_string_in_file "src/contexts/AuthContext.tsx" "initializeTokenRefresh"
echo ""

echo "4. Checking CSRF Protection"
echo "----------------------------"
check_string_in_file "src/utils/auth/csrfProtection.ts" "X-CSRF-Token"
check_string_in_file "src/utils/auth/csrfProtection.ts" "requiresCsrfProtection"
check_string_in_file "src/lib/api/client.ts" "addCsrfHeader"
check_string_in_file "src/app/[locale]/layout.tsx" "CsrfInitializer"
echo ""

echo "5. Checking Session Timeout"
echo "----------------------------"
check_string_in_file "src/utils/auth/sessionTimeout.ts" "startSessionTimeout"
check_string_in_file "src/utils/auth/sessionTimeout.ts" "stopMonitoring"
check_string_in_file "src/utils/auth/sessionTimeout.ts" "handleTimeout"
check_string_in_file "src/contexts/AuthContext.tsx" "startSessionTimeout"
echo ""

echo "6. Checking Sensitive Data Filtering"
echo "--------------------------------------"
check_string_in_file "src/lib/utils/secureLogger.ts" "SENSITIVE_FIELDS"
check_string_in_file "src/lib/utils/secureLogger.ts" "sanitizeValue"
check_string_in_file "src/lib/utils/secureLogger.ts" "REDACTED"
check_string_in_file "src/lib/utils/errorLogger.ts" "secureError"
echo ""

echo "7. Checking for Hardcoded Secrets"
echo "-----------------------------------"
# Check common files for hardcoded secrets
FILES_TO_CHECK=(
    "src/lib/api/config.ts"
    "src/contexts/AuthContext.tsx"
    ".env.local"
    ".env"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        check_no_sensitive_data "$file"
    fi
done
echo ""

echo "8. Checking Environment Variables"
echo "-----------------------------------"
if [ -f ".env.example" ]; then
    pass ".env.example exists"
else
    warn ".env.example not found - consider creating one"
fi

if [ -f ".env.local" ]; then
    warn ".env.local exists - ensure it's in .gitignore"
    if grep -q ".env.local" .gitignore 2>/dev/null; then
        pass ".env.local is in .gitignore"
    else
        fail ".env.local is NOT in .gitignore"
    fi
else
    info ".env.local not found (this is okay)"
fi
echo ""

echo "9. Checking Dependencies"
echo "-------------------------"
if command -v npm &> /dev/null; then
    info "Running npm audit..."
    if npm audit --audit-level=moderate > /dev/null 2>&1; then
        pass "No moderate or higher vulnerabilities found"
    else
        warn "npm audit found vulnerabilities - run 'npm audit' for details"
    fi
else
    warn "npm not found - skipping dependency check"
fi
echo ""

echo "10. Checking TypeScript Configuration"
echo "---------------------------------------"
if [ -f "tsconfig.json" ]; then
    if grep -q '"strict": true' tsconfig.json; then
        pass "TypeScript strict mode is enabled"
    else
        warn "TypeScript strict mode is not enabled"
    fi
else
    fail "tsconfig.json not found"
fi
echo ""

echo "11. Checking Git Configuration"
echo "--------------------------------"
if [ -f ".gitignore" ]; then
    pass ".gitignore exists"
    
    # Check for important entries
    if grep -q "node_modules" .gitignore; then
        pass "node_modules is in .gitignore"
    else
        fail "node_modules is NOT in .gitignore"
    fi
    
    if grep -q ".env" .gitignore; then
        pass ".env files are in .gitignore"
    else
        fail ".env files are NOT in .gitignore"
    fi
else
    fail ".gitignore not found"
fi
echo ""

echo "12. Checking for Console.log Usage"
echo "------------------------------------"
# Check for direct console.log usage (should use secureLog instead)
if grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "secureLog" | grep -v "// " | grep -v "test" > /dev/null; then
    warn "Found direct console.log usage - consider using secureLog"
    info "Run: grep -r 'console\.log' src/ --include='*.ts' --include='*.tsx' | grep -v 'secureLog'"
else
    pass "No direct console.log usage found"
fi
echo ""

# Summary
echo "=============================="
echo "Security Test Summary"
echo "=============================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical security checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some security checks failed. Please review and fix.${NC}"
    exit 1
fi
