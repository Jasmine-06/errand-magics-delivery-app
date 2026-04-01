# Overview

This is a full-stack delivery partner mobile web application for Bolpur Mart, built with React, Express, and TypeScript. The application provides a Progressive Web App (PWA) experience for delivery partners to manage orders, track earnings, and view delivery history. It features real-time order management, offline capabilities, and Firebase integration for authentication and data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) mode
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker for offline caching, web app manifest for mobile installation
- **Design System**: Custom design tokens with CSS variables, mobile-first responsive design

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with tsx for development server
- **Production**: Compiled with esbuild for optimal performance
- **API Design**: RESTful API structure with /api prefix for all endpoints
- **Error Handling**: Centralized error middleware with structured error responses

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud hosting
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Development Storage**: In-memory storage implementation for local development
- **Caching**: Browser-based caching through service worker for offline functionality

## Authentication and Authorization
- **Provider**: Firebase Authentication for secure user management
- **Strategy**: Email/password authentication with phone number mapping
- **Session Management**: Firebase auth state persistence with automatic token refresh
- **Authorization**: Role-based access control for delivery partners
- **Security**: Firebase security rules and client-side auth state validation

## External Dependencies
- **Firebase Services**: Authentication, Firestore database, and Cloud Messaging for push notifications
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling with custom design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Handling**: date-fns for comprehensive date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Development Tools**: Replit integration for cloud-based development environment