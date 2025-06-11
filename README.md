
# Career Compass: Your AI-Powered Career Navigator

Career Compass is a Next.js web application designed to help users gain insights into their career paths. It leverages AI to analyze resumes, understand personality traits through a quiz, and provide personalized career suggestions, detailed roadmaps, and an interactive chatbot for further guidance.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Design & Styling](#design--styling)
  - [Typography](#typography)
  - [Color Scheme](#color-scheme)
  - [Dark Mode & Light Mode](#dark-mode--light-mode)
- [Key Functionality & User Flows](#key-functionality--user-flows)
  - [User Experience](#user-experience)
  - [Implemented Features](#implemented-features)
  - [Key Navigation Flows](#key-navigation-flows)
- [Unique Selling Propositions](#unique-selling-propositions)
- [AI Integration & Data Flow](#ai-integration--data-flow)
  - [AI Model Integration](#ai-model-integration)
  - [Key AI Flows](#key-ai-flows)
  - [Cloud Services](#cloud-services)
  - [User Data Management & Caching](#user-data-management--caching)
- [UI Components](#ui-components)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Development Servers](#running-the-development-servers)
  - [Building for Production](#building-for-production)
- [Folder Structure](#folder-structure)

## Overview

Navigating the modern job market can be complex. Career Compass aims to simplify this by providing users with AI-driven tools to:
- Understand their resume's strengths and weaknesses.
- Explore career paths aligned with their personality.
- Receive tailored career suggestions and actionable roadmaps.
- Engage with an AI assistant for further career counseling.

## Core Features

-   **User Authentication**: Simple local (mock) authentication to manage user access and cache data per user.
-   **Resume Upload & Analysis**:
    -   Users can upload their resume (PDF, DOCX, common image formats).
    -   OCR is used to extract text from the resume.
    -   AI-powered **Resume Grader** provides an overall score, detailed feedback on clarity, impact, format, ATS friendliness, positive points, and areas for improvement.
-   **Personality Quiz**: A concise MBTI-style quiz to refine career suggestions.
-   **AI Career Suggestions**:
    -   Combines resume analysis and personality quiz results.
    -   Offers 3-5 tailored career suggestions with AI reasoning.
-   **Career Roadmap Generator**:
    -   Generates detailed, structured roadmaps for suggested careers.
    -   Includes introduction, skills to develop, key milestones, learning resources, networking tips, timeline estimates, and next actionable steps.
-   **AI Career Help Chatbot**:
    -   Allows users to ask follow-up questions related to their results.
    -   Context-aware, utilizing the user's resume, quiz, suggestions, and roadmaps.
-   **Client-Side Data Caching**: User-specific data (resume, quiz, AI results) is cached in `localStorage` and can be reset by the user.
-   **Theme Toggle**: Supports light and dark modes, with user preference saved.

## Tech Stack

-   **Frontend Framework**: Next.js (with App Router)
-   **UI Library**: React
-   **Component Library**: ShadCN UI
-   **Styling**: Tailwind CSS
-   **AI Integration**: Genkit
-   **Language Models**: Google Gemini (via Genkit Google AI Plugin)
-   **State Management**: React Context API (for Auth and App data)
-   **File Processing**:
    -   `pdfjs-dist` for PDF text extraction.
    -   `mammoth` for DOCX text extraction.
    -   `tesseract.js` for OCR on images and fallback for PDFs.
-   **Linting & Formatting**: ESLint, Prettier (implied by Next.js standards)
-   **Version Control**: Git

## Design & Styling

### Typography
(As defined in `src/app/globals.css` and `tailwind.config.ts`)

-   **Primary Font (Body & Headlines)**: 'Space Grotesk', sans-serif
-   **Code Font (Conceptual)**: `monospace`

*(Specific weights and sizes are managed by Tailwind CSS utility classes and ShadCN component styles.)*

### Color Scheme
(Effective HSL theme from `src/app/globals.css`)

-   **Primary (Vibrant Purple)**:
    -   Light/Dark Mode: `hsl(273 70% 61%)` (#9D4EDD)
-   **Accent (Electric Blue)**:
    -   Light/Dark Mode: `hsl(212 100% 67%)` (#59A5FF)
-   **Background**:
    -   Light Mode: `hsl(276 83% 97%)` (#F5EEFE - Light Purple)
    -   Dark Mode: `hsl(273 15% 10%)` (Dark Purple)
-   **Foreground (Text)**:
    -   Light Mode: `hsl(273 25% 25%)` (Darker Purple/Grey)
    -   Dark Mode: `hsl(276 83% 90%)` (Light Purple text)
-   **Card Background**:
    -   Light Mode: `hsl(0 0% 100%)` (White)
    -   Dark Mode: `hsl(273 15% 15%)` (Darker Purple card)
-   **Border**:
    -   Light Mode: `hsl(273 50% 88%)` (Light purple border)
    -   Dark Mode: `hsl(273 20% 30%)`
-   **Destructive (Errors/Warnings)**:
    -   Light Mode: `hsl(0 84.2% 60.2%)`
    -   Dark Mode: `hsl(0 62.8% 30.6%)`

### Dark Mode & Light Mode
The application fully supports both light and dark themes. The theme preference is persisted in the user's browser via `localStorage`. The toggle is available in the header.

## Key Functionality & User Flows

### User Experience
The application is designed for a single user role. All authenticated users have access to the same set of features. The interface is built to be responsive for desktop, tablet, and mobile devices.

### Implemented Features
(Refer to [Core Features](#core-features) section above)

### Key Navigation Flows
1.  **Initial Setup & Dashboard Access**:
    User visits landing page (`/`) → Clicks "Login" → Enters any email on Login Page (`/login`) → Redirected to Dashboard (`/dashboard`).
2.  **Resume Analysis**:
    From Dashboard or Header → Navigates to "Resume" (`/upload-resume`) → Uploads resume file → Views extracted text preview → Clicks "Analyze Resume" → Views detailed AI-generated resume report.
3.  **Personality Quiz**:
    From Dashboard or Header → Navigates to "Quiz" (`/quiz`) → Answers questions → Submits quiz → Views completion message.
4.  **Viewing AI Results (Suggestions & Roadmaps)**:
    From Dashboard or Header → Navigates to "Results" (`/results`) →
    - If resume and quiz are complete, AI suggestions are fetched, followed by roadmaps.
    - User views personalized career suggestions and their reasoning.
    - User explores detailed, structured career roadmaps for each suggestion.
5.  **Interacting with AI Chatbot**:
    On "Results" page, after suggestions/roadmaps load → User types questions into chat input → Receives AI responses based on their profile and general career knowledge.
6.  **Data Reset**:
    User clicks "Reset Data" in Header → Confirms action in dialog → All cached application data (resume, quiz, AI results) for the current user is cleared from `localStorage`.
7.  **Logout**:
    User clicks "Logout" in Header → Session cleared → Redirected to landing page (`/`).

## Unique Selling Propositions

-   **Personalized AI Guidance**: Leverages AI to provide career advice tailored to individual resume content and personality quiz outcomes.
-   **Structured & Actionable Insights**: Delivers resume feedback and career roadmaps in a clear, categorized, and actionable format.
-   **Interactive Learning**: The AI chatbot allows users to dive deeper into their results and ask specific career-related questions.
-   **User-Centric Caching**: Persists user data (resume, quiz, AI results) locally in the browser for a seamless experience across sessions, with an option for users to reset their data.
-   **Modern & Responsive UI**: Built with ShadCN UI and Tailwind CSS for a clean, accessible, and mobile-first user experience.

## AI Integration & Data Flow

### AI Model Integration
-   **Core AI Engine**: Genkit framework.
-   **Language Models**: Google Gemini models (e.g., `gemini-2.0-flash` specified in `src/ai/genkit.ts`).
-   **Capabilities Utilized**:
    -   Text Generation & Understanding: For analyzing resumes, interpreting quiz results, generating career suggestions, roadmaps, and chatbot responses.
    -   Structured Data Output: AI models are prompted to return data in specific JSON schemas (defined with Zod in each flow).

### Key AI Flows
(Located in `src/ai/flows/`)
-   `resume-grader.ts`: Analyzes resume text and provides a structured report with scores and feedback.
-   `ai-career-suggestions.ts`: Generates career suggestions based on resume text and personality quiz results.
-   `career-roadmap-generator.ts`: Creates detailed, multi-step roadmaps for given career suggestions.
-   `career-chat-flow.ts`: Powers the contextual AI chatbot, taking into account conversation history and user data.

### Cloud Services
-   **Google AI Platform**: Accessed via the `@genkit-ai/googleai` plugin for interacting with Gemini models. Requires a `GOOGLE_API_KEY`.

### User Data Management & Caching
-   **Authentication**: Mock local authentication. User email (or a derivative) is used as an identifier.
-   **Theme Preference**: Stored client-side in `localStorage`.
-   **Application Data (Resume, Quiz, AI Results)**:
    -   Stored client-side in `localStorage`, keyed by the authenticated user's email.
    -   Managed by `AppContext`.
    -   Data is loaded upon login and saved whenever modified.
    -   Users can clear their cached data via a "Reset Data" button in the header.
-   **Uploaded Files/Input Data**: Text extracted from uploaded files or user inputs is sent to Genkit flows for processing. The raw files themselves are not stored by the application post-processing.

## UI Components
The application heavily utilizes components from **ShadCN UI**, providing a consistent and modern look and feel. Key components include:
-   Layout & Navigation: `Card`, `Header` (custom), `Button`, `Link`.
-   Content Display: `Card`, `Alert`, `Accordion`, `Progress`, `Badge`.
-   Forms & Input: `Input`, `RadioGroup`, `Label`, `Button`.
-   Interaction & Feedback: `AlertDialog`, `Toast`, `ScrollArea`, `Spinner` (custom).

## Getting Started

### Prerequisites
-   Node.js (v18 or later recommended)
-   npm or yarn

### Environment Variables
Create a `.env` file in the root of the project and add your Google API key:
```env
GOOGLE_API_KEY=your_google_api_key_here
```
This key is required for the Genkit AI flows to function.

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/kxshish19/careercompass.git
    cd careercompass
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the Development Servers
You need to run two development servers concurrently: one for the Next.js frontend and one for Genkit.

1.  **Start the Genkit development server**:
    Open a terminal and run:
    ```bash
    npm run genkit:dev
    # Or for auto-reloading on changes to AI flows:
    # npm run genkit:watch
    ```
    This usually starts on `http://localhost:3400`.

2.  **Start the Next.js development server**:
    Open another terminal and run:
    ```bash
    npm run dev
    ```
    This usually starts the application on `http://localhost:9002`.

Open `http://localhost:9002` in your browser to view the app.

### Building for Production
```bash
npm run build
npm run start
```
Ensure Genkit flows are also deployed or accessible by your production environment. For Firebase App Hosting, Genkit flows are typically bundled with the Next.js app.

## Folder Structure

A brief overview of the key directories:

-   `src/app/`: Contains the Next.js pages and layouts using the App Router.
    -   `src/app/(app)/`: Authenticated routes (dashboard, quiz, results, etc.).
    -   `src/app/login/`: Login page.
    -   `src/app/page.tsx`: Landing page.
-   `src/ai/`: Houses all Genkit related code.
    -   `src/ai/flows/`: Definitions for individual AI flows (e.g., `resumeGrader.ts`, `aiCareerSuggestions.ts`).
    -   `src/ai/genkit.ts`: Genkit global configuration.
    -   `src/ai/dev.ts`: Entry point for the Genkit development server.
-   `src/components/`: Shared React components.
    -   `src/components/core/`: Core application components like Header, Providers, Spinner.
    -   `src/components/ui/`: ShadCN UI components.
-   `src/contexts/`: React Context API providers (e.g., `AuthContext.tsx`, `AppContext.tsx`).
-   `src/hooks/`: Custom React hooks (e.g., `useToast.ts`).
-   `src/lib/`: Utility functions (e.g., `utils.ts`).
-   `public/`: Static assets.

---

This README provides a comprehensive guide to Career Compass. Feel free to explore and enhance its capabilities!
