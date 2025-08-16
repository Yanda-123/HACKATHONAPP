# Overview

HerVital is a mental health and wellness companion application built as a full-stack web application. The project provides comprehensive mental health support through features like clinic location services, appointment booking, AI-powered chatbot assistance, mental health questionnaires, video consultations, medication reminders, and facial recognition for emotion analysis. The application is designed with a mobile-first approach and targets women's mental health specifically.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using **React 18** with **TypeScript** for type safety. The application uses **Vite** as the build tool and development server, providing fast hot module replacement. **Wouter** is used for lightweight client-side routing instead of React Router. The UI is constructed using **shadcn/ui** components built on top of **Radix UI** primitives, providing accessible and customizable components. **Tailwind CSS** handles styling with a custom design system using CSS variables for theming. **TanStack Query** manages server state, caching, and API interactions efficiently.

## Backend Architecture
The server is built with **Express.js** and uses **TypeScript** for consistency across the stack. The application follows a RESTful API design pattern with routes organized in a centralized router system. **Drizzle ORM** provides type-safe database operations with **PostgreSQL** as the primary database. The server includes comprehensive error handling middleware and request logging capabilities.

## Authentication System
The application implements **Replit's OpenID Connect (OIDC)** authentication system using **Passport.js** strategies. Session management is handled through **express-session** with PostgreSQL-based session storage using **connect-pg-simple**. The authentication system includes proper middleware for protecting routes and managing user sessions across the application.

## Database Design
**PostgreSQL** serves as the primary database with **Drizzle ORM** providing the data access layer. The schema includes comprehensive tables for users, clinics, appointments, chat logs, questionnaire results, reminders, meditation sessions, and user progress tracking. The database design supports complex relationships between entities and includes proper indexing for performance.

## Development Environment
The project is configured for **Replit** deployment with specific development tools including the Replit development banner and cartographer plugin for enhanced debugging. **ESBuild** handles server-side bundling for production builds, while Vite manages client-side bundling and development serving.

## Mobile-First Design
The application implements a mobile-first responsive design approach using Tailwind CSS breakpoints. The layout system includes a dedicated `MobileLayout` component that provides consistent header navigation, language selection, and user controls across all pages.

# External Dependencies

## Database Services
- **Neon Database** (@neondatabase/serverless) - Serverless PostgreSQL database hosting
- **PostgreSQL** - Primary database system accessed through postgres client library

## Authentication Services
- **Replit Auth** - OpenID Connect authentication provider for user login and session management
- **OpenID Client** - Handles OIDC authentication flows and token management

## AI/ML Services
- **OpenAI API** - Powers the chatbot functionality with GPT-based natural language processing for mental health conversations and support

## Frontend Libraries
- **Radix UI** - Comprehensive collection of accessible React components including dialogs, forms, navigation, and interactive elements
- **Lucide React** - Icon library providing consistent iconography throughout the application
- **TanStack Query** - Advanced data fetching and state management for server state synchronization
- **React Hook Form** - Form handling with validation and performance optimization

## Styling and UI
- **Tailwind CSS** - Utility-first CSS framework for responsive design and styling
- **Class Variance Authority** - Utility for managing component variants and conditional styling
- **shadcn/ui** - Pre-built component library built on Radix UI with Tailwind CSS integration

## Development Tools
- **Vite** - Modern build tool and development server with fast hot module replacement
- **TypeScript** - Static type checking across the entire application stack
- **Replit Development Tools** - Specialized tools for Replit environment including runtime error overlay and cartographer debugging