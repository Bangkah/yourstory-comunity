# Contributing to Your Story Community

Thank you for your interest in contributing to Your Story Community! We welcome contributions from everyone.

## How to Get Started

### 1. Fork the Repository
```bash
# Go to https://github.com/Bangkah/yourstory-comunity
# Click "Fork" button
git clone https://github.com/Bangkah/yourstory-comunity.git
cd yourstory-comunity
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

Follow the code style and guidelines:
- **Code Standard:** PSR-12 for PHP
- **Database:** Use migrations for schema changes
- **Tests:** Write tests for new features
- **Documentation:** Update docs for API changes

### 4. Run Tests
```bash
docker-compose exec app php artisan test
```

Ensure all tests pass before submitting.

### 5. Commit Your Changes
```bash
git commit -m "feat: add new feature" -m "Description of changes"
# or
git commit -m "fix: resolve issue #123"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `style:` - Code style (formatting, missing semicolons, etc.)

### 6. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Go to GitHub and click "Create Pull Request"

## Development Guidelines

### Setting Up Development Environment

```bash
# Clone repository
git clone https://github.com/Bangkah/yourstory-comunity.git
cd yourstory-comunity

# Follow SETUP_GUIDE.md for installation
# See: SETUP_GUIDE.md
```

### Code Style

**PHP:**
```php
// Use proper type hints
public function getUser(int $id): User

// Use proper spacing
$result = functionCall($arg1, $arg2);

// Use descriptive names
$userFullName = $user->first_name . ' ' . $user->last_name;
```

**Tests:**
```php
class FeatureTest extends TestCase {
    use RefreshDatabase;
    
    public function test_user_can_create_story(): void {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $response = $this->actingAs($user)
            ->post('/api/stories', [...]);
        
        // Assert
        $this->assertEquals(201, $response->status());
    }
}
```

### Database Migrations

```php
// Migrations must be in correct order
// Prefix: YYYY_MM_DD_HHMMSS_description.php

public function up(): void {
    Schema::create('table_name', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('name');
        $table->timestamps();
    });
}
```

### API Endpoints

When adding new endpoints:

1. **Create Route** in `routes/api.php`
2. **Create Controller Method** in `app/Http/Controllers/Api/`
3. **Add Tests** in `tests/Feature/`
4. **Update Documentation** in `BACKEND_DOCUMENTATION.md`
5. **Update Postman Collection** in `postman_collection.json`

Example endpoint:
```php
// Route
Route::get('/stories/{id}', [StoryController::class, 'show']);

// Controller
public function show(Story $story): JsonResponse {
    $this->authorize('view', $story);
    
    return $this->success($story->load('user', 'comments', 'likes'));
}

// Test
public function test_can_view_story(): void {
    $story = Story::factory()->create();
    
    $response = $this->get("/api/stories/{$story->id}");
    
    $this->assertEquals(200, $response->status());
}
```

## Documentation

**Important:** Update documentation for all changes:

- **New Endpoint?** → Update [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
- **New Feature?** → Update [README.md](README.md)
- **Database Change?** → Update [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **API Change?** → Update [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **New Process?** → Update [TESTING_GUIDE.md](TESTING_GUIDE.md)

## Testing

All code must be tested:

```bash
# Run all tests
docker-compose exec app php artisan test

# Run specific test
docker-compose exec app php artisan test tests/Feature/StoryTest.php

# Run with coverage
docker-compose exec app php artisan test --coverage
```

Target: **Maintain 80%+ code coverage**

## Pull Request Process

1. **Update README.md** if adding features
2. **Update Docs** as needed
3. **Add Tests** for all new functionality
4. **Ensure Tests Pass** - run `php artisan test`
5. **Submit PR** with clear description

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)

## Related Issues
Closes #(issue number)

## How Has This Been Tested?
Describe the tests you ran

## Checklist:
- [ ] My code follows PSR-12 style guidelines
- [ ] I have commented my code
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests passed locally with my changes
```

## Reporting Issues

Found a bug? Have a feature request?

1. Go to [Issues](https://github.com/Bangkah/yourstory-comunity/issues)
2. Check if issue already exists
3. If not, click "New Issue"
4. Provide clear description and steps to reproduce

**Bug Report Template:**
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Firefox]
- PHP Version: 8.4
- Laravel Version: 11
```

## Code Review

All PRs will be reviewed for:

- ✅ Code quality
- ✅ Test coverage
- ✅ Documentation
- ✅ Performance
- ✅ Security

Feedback will be provided constructively.

## Questions?

- Check [START_HERE.md](START_HERE.md) for navigation
- Review [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
- Check existing issues and discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as this project (MIT License).

---

Thank you for contributing! 🎉

Last Updated: December 2025
