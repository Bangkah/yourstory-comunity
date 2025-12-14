# Security Policy

## Reporting a Vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability in Your Story Community, please email us at your-security-email@example.com with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will:
- Acknowledge receipt within 48 hours
- Provide a security fix within 72 hours (for critical issues)
- Credit you in the security advisory (if you wish)

## Security Features

### Authentication & Authorization
- **Sanctum**: Token-based API authentication
- **Role-Based Access Control**: Admin, Moderator, User roles
- **Password Security**: Bcrypt hashing with configurable rounds
- **Token Expiration**: Automatic token rotation and expiration
- **Multi-factor Authentication**: Ready for MFA implementation

### API Security
- **Rate Limiting**: Per-endpoint rate limiting
  - Login: 5 attempts per minute
  - Create: 30 per minute
  - Toggle: 60 per minute
  - Notification: 120 per minute
- **CORS Protection**: Configured CORS headers
- **CSRF Protection**: CSRF token validation
- **Request Validation**: Input validation and sanitization

### Data Protection
- **SQL Injection Prevention**: Eloquent ORM parameterized queries
- **Soft Deletes**: Data recovery capability
- **Database Encryption**: Ready for column-level encryption
- **Sensitive Data**: Never logged or exposed in responses
- **Data Integrity**: Foreign key constraints, unique constraints

### Infrastructure Security
- **Docker Isolation**: Container-based isolation
- **Environment Variables**: Sensitive data in .env (not committed)
- **HTTPS Ready**: Nginx SSL/TLS support configured
- **Database Isolation**: MySQL in separate container with credentials
- **Network Segmentation**: Services on private Docker networks

### Code Security
- **Dependency Management**: composer.lock for reproducible builds
- **Regular Updates**: Automated dependency vulnerability scanning
- **Input Validation**: Comprehensive request validation
- **Authorization Checks**: Policy-based authorization on sensitive operations
- **Audit Logging**: Event-based logging for sensitive actions

## Security Best Practices

### For Deployment
1. Always use `.env` for sensitive configuration
2. Set strong database passwords
3. Enable HTTPS in production
4. Use environment-specific variables
5. Keep Laravel and dependencies updated
6. Use a Web Application Firewall (WAF)
7. Regular security audits
8. Database backups (daily recommended)

### For Development
1. Never commit `.env` or credentials
2. Use `.env.example` for configuration templates
3. Validate all user inputs
4. Sanitize output
5. Use prepared statements (automatic with Eloquent)
6. Keep dependencies updated
7. Code review before merging

### Environment Configuration
```bash
# Production
APP_DEBUG=false
APP_ENV=production

# Database
DB_HOST=secure-database-host
DB_PASSWORD=strong-password-here
DB_ENCRYPT=true

# API
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=yourdomain.com
```

## Known Security Considerations

### Current (Phase 1)
- Token invalidation on logout is partial (acceptable for stateless API)
- Basic rate limiting (should use dedicated service in production)
- No image encryption (implement for sensitive content)

### Planned (Phase 2+)
- WebSocket authentication
- Two-factor authentication (2FA)
- OAuth2 provider integration
- Advanced rate limiting with Redis
- Request signing for critical operations
- Content encryption
- Advanced audit logging

## Security Headers

The following security headers are configured:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Third-Party Dependencies

All dependencies are managed through Composer with:
- `composer.lock` for reproducible builds
- Regular vulnerability scanning
- Automated security updates (recommended)

## Compliance

- **GDPR Ready**: User data management endpoints
- **Data Privacy**: Sensitive data handling
- **Audit Trail**: Event-based logging system
- **Data Retention**: Soft delete policy

## Support

For security questions (non-vulnerability):
- Email: your-security-email@example.com
- Security advisory: https://github.com/Bangkah/yourstory-comunity/security/advisories

## Security Changelog

- **2024-12-15**: Initial security policy (v1.0)
  - Sanctum authentication
  - Role-based access control
  - Rate limiting implemented
  - CORS protection
  - Input validation
  - Error handling

---

**Last Updated**: 2024-12-15  
**Version**: 1.0  
**Status**: Active
