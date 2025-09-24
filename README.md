# DEVS x CSI Security Workshop

⚠️ **WARNING**: This application is intentionally vulnerable

## Overview

This workshop demonstrates common web application security vulnerabilities, specifically:
- **SQL Injection** attacks
- **Cross-Site Scripting (XSS)** attacks

The application is a simple login system built with Node.js, Express, and SQLite that contains deliberate security flaws for educational purposes.

## Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation
```bash
npm install
npm start
```

The application will start on `http://localhost:3000`

### Demo User Credentials
- **Username**: `alice`
- **Password**: `password123`

## Vulnerabilities Demonstrated

### 1. SQL Injection (Line 49 in server.js)

#### The Vulnerable Code
```javascript
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
```

This code directly concatenates user input into the SQL query without sanitization.

#### How to Exploit

**Method 1: Comment-based bypass**
- Username: `alice'--`
- Password: (anything or leave empty)
- Result: `SELECT * FROM users WHERE username = 'alice'--' AND password = 'anything'`

**Method 2: Always-true condition**
- Username: `alice' OR '1'='1'--`
- Password: (anything)
- Result: `SELECT * FROM users WHERE username = 'alice' OR '1'='1'--' AND password = 'anything'`

**Method 3: Union-based attack**
- Username: `' UNION SELECT 1,'admin','fake' --`
- Password: (anything)
- Result: Creates a fake admin user in the result set

#### The Secure Fix
```javascript
// Use parameterized queries
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.get(query, [username, password], (err, row) => {
    // Handle result
});
```
#### Breakdown
In this example,
```
'' OR '1'='1'
```
turns into
```
''' OR ''1''=''1'
```
The outermost single quotes mark the whole string literal, each original single quote inside the input is doubled to '' so it becomes part of the string, not a string terminator.

### 2. Cross-Site Scripting (XSS) (Line 68 in server.js)

#### The Vulnerable Code
```javascript
<h1>Welcome, ${username}</h1>
```

User input is directly inserted into HTML without encoding.

#### How to Exploit
- Username: `<script>alert('XSS Attack!')</script>`
- Password: Use any SQL injection payload to bypass authentication
- Result: JavaScript executes in the browser

#### The Secure Fix
```javascript
// HTML encode user input
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

<h1>Welcome, ${escapeHtml(username)}</h1>
```
#### Breakdown
Simply remove the unsafe characters such as `<`, `>`, `&`, `"`, and `'` by replacing them with their corresponding HTML entities.

## Workshop Activities

### Activity 1: Identify the Vulnerability
1. Examine the code in `server.js`
2. Find the line where SQL injection is possible
3. Understand why this code is vulnerable

### Activity 2: Exploit the Vulnerability
1. Start the application (`npm start`)
2. Navigate to `http://localhost:3000`
3. Try the SQL injection payloads listed above
4. Observe the console logs to see the malicious SQL queries

### Activity 3: Understand the Impact
1. Try to login without knowing the correct password
2. Try to access other users' accounts
3. Experiment with different SQL injection payloads

### Activity 4: Fix the Vulnerability
1. Modify the code to use parameterized queries
2. Test that normal login still works
3. Verify that SQL injection attacks no longer work

### Activity 5: Prevent XSS
1. Try the XSS payload after bypassing authentication
2. Implement HTML encoding to prevent script execution
3. Test that the fix works

## Debug Endpoint

For educational purposes, you can view all users in the database:
- GET `http://localhost:3000/_debug/users`

## Common SQL Injection Patterns

```sql
-- Authentication bypass
admin'--
admin'/*
' OR '1'='1'--
' OR 1=1--

-- Union-based information extraction
' UNION SELECT username, password FROM users--
' UNION SELECT 1,2,3--

-- Boolean-based blind injection
' AND '1'='1'--
' AND '1'='2'--
```

## Real-World Impact

SQL injection attacks can lead to:
- **Data breaches** - Unauthorized access to sensitive data
- **Authentication bypass** - Login without credentials
- **Data manipulation** - Modifying or deleting database records
- **System compromise** - In some cases, executing system commands

## Best Practices for Prevention

1. **Use parameterized queries/prepared statements**
2. **Input validation** - Whitelist acceptable input
3. **Principle of least privilege** - Database users should have minimal permissions
4. **Regular security audits** - Code reviews and penetration testing
5. **Keep software updated** - Apply security patches promptly

## Resources for Further Learning

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)