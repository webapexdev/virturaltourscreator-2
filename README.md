# VTC Challenge - Notes Management Application

A full-stack notes management application built with Symfony (PHP) backend and React (TypeScript) frontend, featuring user authentication, email verification, and CRUD operations for notes.

## 🚀 Quick Start

### Prerequisites

- **Docker** (version 24 or higher) - **Required**
- **Docker Compose** (version 1.29 or higher) - **Required**
- **Node.js** (version 18 or higher)
- **Yarn** (or npm)

> **Important**: This project uses Docker for the backend. The Docker container runs **PHP 8.2**. If you try to run the project locally without Docker, you need **PHP 7.4 or higher** (PHP 7.0-7.3 will fail due to typed properties syntax). However, **using Docker is strongly recommended** as it ensures consistent environment across all systems.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VtcChallenge
   ```

2. **Copy environment file**
   ```bash
   cp .env.dist .env
   ```
   > Note: If `.env.dist` doesn't exist, create `.env` with:
   > ```
   > DATABASE_URL="mysql://root:root@db:3306/vtc-db?serverVersion=5.7&charset=utf8mb4"
   > ```

3. **Install PHP dependencies**
   ```bash
   docker-compose up -d
   docker-compose run --rm --entrypoint composer web install
   ```

4. **Install Node.js dependencies**
   ```bash
   yarn install
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec web php bin/console doctrine:migrations:migrate --no-interaction
   ```

6. **Build frontend assets**
   ```bash
   yarn build
   ```

7. **Start development server (optional - for hot reload)**
   ```bash
   yarn watch
   ```

8. **Access the application**
   - Open your browser and navigate to: `http://localhost:81`

### Docker Services

The `docker-compose.yml` file sets up:
- **Web service**: PHP 8.2 + Nginx + PHP-FPM (port 81)
- **Database service**: MySQL 5.7 (port 3307)

> **Note**: `docker-compose up -d` is required to start the Docker containers. The `-d` flag runs containers in detached mode.

---

## 📋 Implemented Features

### Authentication System

#### User Registration
- Email and password registration
- Password hashing with Symfony's auto password hasher
- Email verification token generation (24-hour expiration)
- Confirmation emails saved to `var/emails/` directory
- Auto-verification option (click "Go to Login" to simulate email verification)

#### Email Verification
- **Manual verification**: Click confirmation link from email file
- **Auto-verification**: Click "Go to Login" button after registration
- Database-level verification check (`isVerified` field)
- Login blocked until account is verified

#### Login & Session Management
- JSON-based authentication (session-based, not stateless)
- Custom authentication handlers for success/failure
- User verification check before login (via `UserChecker`)
- Session persistence across page reloads

### Notes Management

#### CRUD Operations
- **Create**: Add new notes with title, content, category, and status
- **Read**: View all notes (all users can see all notes)
- **Update**: Edit notes (only creator can edit)
- **Delete**: Remove notes (only creator can delete)

#### Note Features
- **Fields**: Title, Content, Category, Status (new/todo/done)
- **Categories**: Work, Personal, Important (plus custom categories from database)
- **Color coding**: Different colors for different categories
- **Creator badge**: Shows note creator with "(You)" indicator for own notes

#### Search & Filtering
- **Text search**: Search by title or content (debounced 400ms)
- **Status filter**: Filter by new/todo/done
- **Category filter**: Filter by category
- **Real-time updates**: Filters apply immediately, search is debounced

### Frontend Architecture

#### Technology Stack
- **React 18** with TypeScript
- **React Router DOM 6** for client-side routing
- **React Query (TanStack Query)** for data fetching and caching
- **Tailwind CSS 4** for styling
- **Axios** for API communication

#### Design System
- **Atomic Design**: Atoms → Molecules → Organisms
- **Reusable Components**: Button, Input, Textarea, Dropdown, Card
- **Custom Dropdown**: Replaces native `<select>` for better styling
- **Responsive Design**: Mobile-friendly grid layouts

#### Routing
- `/login` - Login page
- `/register` - Registration page
- `/confirm/:token` - Email confirmation
- `/notes` - Notes list
- `/notes/new` - Create note
- `/notes/:id` - View note detail
- `/notes/:id/edit` - Edit note

### Backend Architecture

#### API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/confirm/{token}` - Verify email
- `POST /api/auth/auto-verify` - Auto-verify user (simulation)

**Notes**
- `GET /api/notes` - List all notes (with search/filter params)
- `GET /api/notes/{id}` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

#### Security Features
- **UserChecker**: Verifies email confirmation before login
- **Database verification checks**: All API endpoints check `isVerified` from database
- **Permission checks**: Only note creator can update/delete
- **Session-based authentication**: PHP sessions (not stateless)

#### Database Schema
- **users**: id, email, password, is_verified, confirmation_token, created_at
- **notes**: id, user_id, title, content, category, status, created_at, updated_at

---

## 🧪 Testing the Application

### 1. Registration Flow
1. Navigate to `http://localhost:81/register`
2. Enter email and password (min 6 characters)
3. Click "Register"
4. Check `var/emails/` directory for confirmation email
5. Click "Go to Login" (auto-verifies) or use confirmation link

### 2. Login Flow
1. Navigate to `http://localhost:81/login`
2. Enter registered email and password
3. If not verified, you'll see verification error
4. After verification, login succeeds

### 3. Notes Management
1. **Create Note**: Click "+ Create Note" → Fill form → Submit
2. **View Note**: Click note title to view details
3. **Edit Note**: Click "Edit" button (only for your notes)
4. **Delete Note**: Click "Delete" button (only for your notes)
5. **Search**: Type in search box (debounced 400ms)
6. **Filter**: Use status/category dropdowns

### 4. Email Verification Testing
- Check `var/emails/` directory for saved emails
- Confirmation links format: `http://localhost:81/api/auth/confirm/{token}`
- Auto-verification: Click "Go to Login" after registration

---

## 📁 Project Structure

```
VtcChallenge/
├── assets/                 # Frontend React application
│   ├── components/        # Atomic design components
│   │   ├── atoms/        # Basic components (Button, Input, etc.)
│   │   ├── molecules/    # Composite components (NoteForm, NoteCard)
│   │   └── organisms/    # Complex components (NotesList)
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks (useNotesQuery)
│   ├── services/         # API client (api.ts)
│   ├── context/          # React context (AuthContext)
│   └── utils/            # Utility functions
├── src/                   # Backend Symfony application
│   ├── Controller/Api/   # API controllers
│   ├── Entity/           # Doctrine entities
│   ├── Repository/       # Data repositories
│   ├── Security/        # Authentication handlers
│   └── Service/          # Business logic services
├── config/               # Symfony configuration
├── docker/               # Docker configuration
├── migrations/           # Database migrations
└── public/              # Public web directory
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file with:
```env
DATABASE_URL="mysql://root:root@db:3306/vtc-db?serverVersion=5.7&charset=utf8mb4"
```

### Docker Services

- **Web**: `http://localhost:81` (PHP + Nginx)
- **Database**: `localhost:3307` (MySQL 5.7)

### PHP Version Compatibility

**What happens if you install PHP 7?**

- **With Docker (Recommended)**: ✅ **Works perfectly** - Docker uses PHP 8.2 regardless of your local PHP version
- **PHP 7.4+ (without Docker)**: ✅ **Works** - Minimum required version due to typed properties syntax
- **PHP 7.0-7.3 (without Docker)**: ❌ **Will fail** - You'll get syntax errors like:
  ```
  Parse error: syntax error, unexpected '?' in .../User.php on line 24
  ```
  This happens because the code uses **typed properties** (`private ?int $id = null;`) which require PHP 7.4+

**Recommendation**: Always use Docker to avoid version compatibility issues. The Docker container ensures PHP 8.2 is used consistently.

---

## 🛠️ Development Commands

```bash
# Start Docker containers
docker-compose up -d

# Stop Docker containers
docker-compose down

# View logs
docker-compose logs -f web

# Run Symfony commands
docker-compose exec web php bin/console <command>

# Run database migrations
docker-compose exec web php bin/console doctrine:migrations:migrate

# Clear Symfony cache
docker-compose exec web php bin/console cache:clear

# Install PHP dependencies
docker-compose exec web composer install

# Build frontend assets
yarn build

# Watch mode (hot reload)
yarn watch
```

---

## 📝 Notes

- **PHP Version**: Docker uses PHP 8.2. Minimum PHP 7.4 required if running without Docker (PHP 7.0-7.3 will cause syntax errors due to typed properties)
- **Email Storage**: Confirmation emails are saved to `var/emails/` directory (not actually sent)
- **Session Management**: Uses PHP sessions (stateless: false)
- **Database**: MySQL 5.7 running in Docker
- **Frontend Build**: Assets compiled to `public/build/`
- **React Query**: Used for data fetching, caching, and state management
- **Authentication**: Session-based (not JWT/token-based)

---

## ✅ Requirements Checklist

- ✅ User registration with email verification
- ✅ Email confirmation (simulated via file storage)
- ✅ User login with session management
- ✅ Create, read, update, delete notes
- ✅ Note fields: title, content, category, status
- ✅ Search notes by title/content
- ✅ Filter by status and category
- ✅ SQL database with ORM (Doctrine)
- ✅ Reusable, scalable frontend architecture
- ✅ Well-structured backend API

---

## 🎯 Key Technical Decisions

1. **React Router**: Client-side routing (no page reloads)
2. **React Query**: Data fetching and caching (prevents unnecessary refetches)
3. **Session Authentication**: PHP sessions (simpler than JWT for this use case)
4. **Email Verification**: Database-level enforcement (checked on every request)
5. **Atomic Design**: Scalable component architecture
6. **Custom Dropdown**: Better UX than native select elements

---

## 📞 Support

For issues or questions, please check:
- Docker logs: `docker-compose logs -f`
- Symfony logs: `var/log/dev.log`
- Browser console for frontend errors
