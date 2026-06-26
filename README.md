# Placement Dashboard Automation

## Project Vision

Placement Dashboard Automation is a multi-tenant placement management and analytics platform designed for colleges, students, employers, and administrators.

The platform centralizes placement operations, recruiter management, student applications, placement drives, offer tracking, and advanced analytics into a unified system. It aims to streamline the campus recruitment process while providing actionable insights to improve placement outcomes.

---

## Objectives

* Automate end-to-end placement workflows
* Simplify job and placement drive management
* Improve student-employer engagement
* Provide real-time placement analytics and reporting
* Enable multi-college (multi-tenant) deployment
* Support data-driven decision-making through dashboards and insights

---

## Core Modules

### Student Portal

* Student Registration & Authentication
* Profile Management
* Resume Upload & Document Management
* Job Discovery & Applications
* Application Tracking
* Offer Management
* Notifications

### Employer Portal

* Employer Registration & Verification
* Job Posting & Management
* Candidate Review
* Shortlisting & Selection
* Offer Generation
* Recruitment Analytics

### College Administration

* Student Management
* Employer Management
* Placement Drive Management
* Eligibility Rules Management
* Placement Analytics
* Report Generation

### Super Administration

* Tenant (College) Management
* Platform Monitoring
* System Analytics
* Subscription & Access Control
* Audit & Compliance Monitoring

---

## Technology Stack

### Frontend

* Next.js 14
* React
* TypeScript
* Tailwind CSS

### Backend

* Supabase
* PostgreSQL

### Infrastructure

* Vercel
* Supabase Storage / Cloudinary
* Resend / Nodemailer

### Development Tools

* ESLint
* Prettier
* Git & GitHub

---

## Project Architecture

The platform follows a multi-tenant architecture where each college operates as an isolated tenant while sharing the same application infrastructure.

### User Roles

* Super Admin
* College Admin
* Employer
* Student

### High-Level Workflow

Student → Job Application → Employer Review → Shortlist → Offer → Acceptance

---

## Folder Structure

```text
placement-dashboard-automation/

├── app/
│   ├── (auth)/
│   ├── student/
│   ├── employer/
│   ├── admin/
│   └── super-admin/
│
├── components/
│
├── lib/
│   └── design-tokens.ts
│
├── hooks/
│
├── types/
│
├── utils/
│
├── docs/
│   ├── architecture.md
│   ├── erd.md
│   ├── api-design.md
│   ├── dashboard-kpis.md
│   └── meeting-notes.md
│
├── public/
│
├── .env.example
├── package.json
└── README.md
```

---

## Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Required Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

NEXT_PUBLIC_APP_URL=
```

---

## Local Setup

### Clone Repository

```bash
git clone <repository-url>
```

### Navigate to Project

```bash
cd placement-dashboard-automation
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Open Application

```text
http://localhost:3000
```

---

## Branching Strategy

### Main Branches

```text
main    → Production
dev     → Integration & Testing
```

### Feature Branches

```text
feature/auth

feature/student-dashboard

feature/employer-dashboard

feature/admin-dashboard

feature/jobs

feature/applications

feature/analytics
```

### Workflow

```text
feature/*
      ↓
     dev
      ↓
    main
```

Direct commits to the `main` branch are not allowed.

---

## Coding Standards

* TypeScript for type safety
* ESLint for code quality
* Prettier for formatting
* Reusable components preferred
* Consistent naming conventions
* Proper documentation for major modules

---

## Documentation

All architecture and planning documents are maintained under the `/docs` directory.

* Architecture Design
* Entity Relationship Diagrams (ERD)
* API Specifications
* Dashboard KPI Definitions
* Meeting Notes

---

## Team

### Development Team

* Suha Saleem
* Anshika Saini
* Ayush Gupta

---

## License

Internal Project – Robonics InfoTech
