# Gorgeous Notes - Client Application

A beautiful, modern note-taking application built with React, Redux Toolkit, and a modular architecture.

## 🚀 Features

### Core Functionality

- **Authentication System** - Secure JWT-based authentication with persistent sessions
- **Note Management** - Create, edit, delete, archive, and pin notes
- **Advanced Filtering** - Search by content, filter by category, priority, and tags
- **Real-time Updates** - Optimistic updates with error handling
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Technical Features

- **Modular Architecture** - Clean separation of concerns with organized folder structure
- **State Management** - Redux Toolkit with optimized selectors and middleware
- **Performance Optimized** - Lazy loading, code splitting, and memoized components
- **Error Handling** - Comprehensive error boundaries and user-friendly error messages
- **Testing Suite** - Unit tests, integration tests, and E2E tests
- **Accessibility** - WCAG compliant with proper ARIA labels and keyboard navigation
- **SEO Ready** - Dynamic meta tags and proper semantic HTML

## 🏗️ Architecture

### Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components
│   ├── layout/          # Layout components
│   ├── notes/           # Note-related components
│   ├── profile/         # User profile components
│   └── ui/              # Base UI components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API and external services
├── store/               # Redux store configuration
│   ├── middleware/      # Custom middleware
│   ├── selectors/       # Memoized selectors
│   └── slices/          # Redux slices
├── test/                # Test utilities and setup
├── utils/               # Utility functions
└── config/              # Configuration files
```

### Key Components

#### Authentication System

- **JWT-based authentication** with automatic token refresh
- **Persistent sessions** with secure storage
- **Route protection** with automatic redirects
- **Remember me** functionality

#### State Management

- **Redux Toolkit** for predictable state management
- **Optimized selectors** using createSelector for performance
- **Middleware** for authentication, persistence, and error handling
- **Normalized state** structure for efficient updates

#### Performance Optimizations

- **Lazy loading** for route-based code splitting
- **Memoized components** to prevent unnecessary re-renders
- **Virtual scrolling** support for large lists
- **Bundle optimization** with dynamic imports

#### Error Handling

- **Error boundaries** to catch component errors
- **Global error handlers** for unhandled promises
- **User-friendly error messages** with retry mechanisms
- **Error reporting** and logging system

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run E2E tests
npm run test:all        # Run all tests

# Linting
npm run lint            # Run ESLint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Gorgeous Notes
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing

### Test Structure

- **Unit Tests** - Component and hook testing with React Testing Library
- **Integration Tests** - Full feature flow testing
- **E2E Tests** - End-to-end testing with Playwright
- **Mock Server** - MSW for API mocking

### Running Tests

```bash
# Unit and integration tests
npm run test

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:all
```

### Test Coverage

The project maintains high test coverage with thresholds:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Performance Checklist

- ✅ Code splitting implemented
- ✅ Lazy loading for routes
- ✅ Optimized bundle size
- ✅ Memoized components
- ✅ Efficient state selectors
- ✅ Error boundaries in place
- ✅ Accessibility compliance
- ✅ SEO optimization

### Health Checks

The application includes built-in health checks that run in development:

- Bundle size analysis
- Memory usage monitoring
- Performance metrics collection
- Accessibility audit
- SEO audit

## 🔧 Configuration

### Redux Store

The store is configured with:

- **Auth slice** - User authentication state
- **Notes slice** - Notes data and filtering
- **UI slice** - Theme, notifications, and UI state
- **Middleware** - Authentication, persistence, and error handling

### Routing

Routes are configured with:

- **Public routes** - Login, register
- **Protected routes** - Notes, profile
- **Route guards** - Authentication checks
- **Lazy loading** - Code splitting per route

### API Integration

- **Axios-based** HTTP client with interceptors
- **Automatic token** attachment
- **Error handling** with retry logic
- **Request/response** transformation

## 🎨 Styling

### Design System

- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Responsive design** with mobile-first approach
- **Dark theme** with glassmorphism effects

### Component Library

- Reusable UI components with consistent styling
- Accessible form controls with proper labeling
- Loading states and error handling
- Responsive layouts and navigation

## 🔒 Security

### Authentication

- JWT tokens with secure storage
- Automatic token refresh
- Session management with device fingerprinting
- Secure logout with cleanup

### Data Protection

- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure API communication

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commits for clear history
- TypeScript support for type safety

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Redux Toolkit for simplified state management
- Tailwind CSS for the utility-first approach
- Framer Motion for beautiful animations
- Testing Library for excellent testing utilities

---

Built with ❤️ using modern web technologies.
