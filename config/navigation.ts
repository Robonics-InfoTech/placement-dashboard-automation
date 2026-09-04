import type { RoleNavigation, QuickAction } from "@/types/navigation";

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar navigation configuration for all 6 roles
// ═══════════════════════════════════════════════════════════════════════════

export const STUDENT_NAV: RoleNavigation = {
  role: "student",
  portalLabel: "Student Portal",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
        { label: "Getting Started", href: "/student/getting-started", icon: "Rocket", comingSoon: true },
        { label: "My Data Export", href: "/student/data-export", icon: "Download", comingSoon: true },
      ],
    },
    {
      label: "OPPORTUNITIES",
      items: [
        { label: "Browse Drives", href: "/student/drives", icon: "Target", comingSoon: true },
        { label: "Browse Internships", href: "/student/internships", icon: "GraduationCap", comingSoon: true },
        { label: "Browse Projects", href: "/student/projects", icon: "FolderKanban", comingSoon: true },
        { label: "Browse Hackathons", href: "/student/hackathons", icon: "Trophy", comingSoon: true },
      ],
    },
    {
      label: "MY APPLICATIONS",
      items: [
        { label: "My Drives", href: "/student/applications", icon: "FileText" },
        { label: "My Internships", href: "/student/my-internships", icon: "Briefcase", comingSoon: true },
        { label: "My Interviews", href: "/student/interviews", icon: "Video", comingSoon: true },
        { label: "My Offers", href: "/student/offers", icon: "Gift" },
      ],
    },
    {
      label: "CAREER SERVICES",
      items: [
        { label: "Mentor Connect", href: "/student/mentors", icon: "Users", comingSoon: true },
        { label: "Resume Review", href: "/student/resume-review", icon: "FileSearch", comingSoon: true },
      ],
    },
    {
      label: "COMMUNICATION",
      items: [
        { label: "Notifications", href: "/student/notifications", icon: "Bell" },
        { label: "Announcements", href: "/student/announcements", icon: "Megaphone", comingSoon: true },
        { label: "Feedback", href: "/student/feedback", icon: "MessageSquare", comingSoon: true },
      ],
    },
    {
      label: "PROFILE & DOCUMENTS",
      items: [
        { label: "My Profile", href: "/student/profile", icon: "User" },
        { label: "My CVs", href: "/student/cvs", icon: "FileText", comingSoon: true },
        { label: "Documents", href: "/student/documents", icon: "FolderOpen" },
      ],
    },
  ],
};

export const ALUMNI_NAV: RoleNavigation = {
  role: "alumni",
  portalLabel: "Alumni Portal",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/alumni/dashboard", icon: "LayoutDashboard" },
        { label: "Getting Started", href: "/alumni/getting-started", icon: "Rocket", comingSoon: true },
      ],
    },
    {
      label: "ALUMNI",
      items: [
        { label: "Browse Alumni Jobs", href: "/alumni/jobs", icon: "Briefcase" },
      ],
    },
    {
      label: "MY APPLICATIONS",
      items: [
        { label: "My Alumni Jobs", href: "/alumni/my-jobs", icon: "FileText", comingSoon: true },
        { label: "My Interviews", href: "/alumni/interviews", icon: "Video", comingSoon: true },
        { label: "My Offers", href: "/alumni/offers", icon: "Gift", comingSoon: true },
      ],
    },
    {
      label: "CAREER SERVICES",
      items: [
        { label: "Resume Review", href: "/alumni/resume-review", icon: "FileSearch", comingSoon: true },
      ],
    },
    {
      label: "COMMUNICATION",
      items: [
        { label: "Notifications", href: "/alumni/notifications", icon: "Bell", comingSoon: true },
        { label: "Feedback", href: "/alumni/feedback", icon: "MessageSquare", comingSoon: true },
      ],
    },
    {
      label: "PROFILE & DOCUMENTS",
      items: [
        { label: "My Profile", href: "/alumni/profile", icon: "User" },
        { label: "Documents", href: "/alumni/documents", icon: "FolderOpen", comingSoon: true },
      ],
    },
  ],
};

export const EMPLOYER_NAV: RoleNavigation = {
  role: "employer",
  portalLabel: "Corporate Partner",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/employer/dashboard", icon: "LayoutDashboard" },
        { label: "Getting Started", href: "/employer/getting-started", icon: "Rocket", comingSoon: true },
        { label: "Campus Partnerships", href: "/employer/partnerships", icon: "Handshake", comingSoon: true },
        { label: "Alerts", href: "/employer/alerts", icon: "Bell", comingSoon: true },
      ],
    },
    {
      label: "STUDENT OPPORTUNITIES",
      items: [
        { label: "Placement Drives", href: "/employer/drives", icon: "Target" },
        { label: "Internships", href: "/employer/internships", icon: "GraduationCap", comingSoon: true },
        { label: "Job Postings", href: "/employer/jobs", icon: "Briefcase" },
        { label: "Alumni Jobs", href: "/employer/alumni-jobs", icon: "Users", comingSoon: true },
      ],
    },
    {
      label: "CANDIDATE PIPELINE",
      items: [
        { label: "Applications", href: "/employer/applications", icon: "FileText", comingSoon: true },
        { label: "Shortlisted", href: "/employer/shortlisted", icon: "CheckCircle", comingSoon: true },
        { label: "Offers", href: "/employer/offers", icon: "Gift" },
        { label: "Offer Templates", href: "/employer/offer-templates", icon: "FileBox", comingSoon: true },
      ],
    },
    {
      label: "RECRUITMENT & SELECTION",
      items: [
        { label: "Hiring Results", href: "/employer/hiring-results", icon: "BarChart3", comingSoon: true },
        { label: "Interview Scheduling", href: "/employer/interviews", icon: "Calendar", comingSoon: true },
      ],
    },
    {
      label: "ORGANIZATION",
      items: [
        { label: "Company Profile", href: "/employer/profile", icon: "Building2" },
        { label: "Feedback", href: "/employer/feedback", icon: "MessageSquare", comingSoon: true },
      ],
    },
  ],
};

export const COLLEGE_ADMIN_NAV: RoleNavigation = {
  role: "college_admin",
  portalLabel: "College Administration",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/college/dashboard", icon: "LayoutDashboard" },
        { label: "Getting Started", href: "/college/getting-started", icon: "Rocket", comingSoon: true },
        { label: "Students", href: "/college/students", icon: "Users", comingSoon: true },
        { label: "Applications", href: "/college/applications", icon: "FileText", comingSoon: true },
        { label: "Drives", href: "/college/drives", icon: "Target", comingSoon: true },
        { label: "Analytics", href: "/college/analytics", icon: "BarChart3", comingSoon: true },
      ],
    },
    {
      label: "STUDENT MANAGEMENT",
      items: [
        { label: "Student Directory", href: "/college/student-directory", icon: "Users", comingSoon: true },
        { label: "Student Verification", href: "/college/verification", icon: "ShieldCheck", comingSoon: true },
        { label: "Eligibility", href: "/college/eligibility", icon: "CheckCircle", comingSoon: true },
      ],
    },
    {
      label: "PLACEMENT MANAGEMENT",
      items: [
        { label: "Placement Drives", href: "/college/placement-drives", icon: "Target", comingSoon: true },
        { label: "Offers", href: "/college/offers", icon: "Gift", comingSoon: true },
        { label: "Placement Results", href: "/college/results", icon: "Award", comingSoon: true },
      ],
    },
    {
      label: "EMPLOYER MANAGEMENT",
      items: [
        { label: "Employers", href: "/college/employers", icon: "Building2", comingSoon: true },
        { label: "Employer Approvals", href: "/college/employer-approvals", icon: "UserCheck", comingSoon: true },
      ],
    },
    {
      label: "REPORTING",
      items: [
        { label: "Placement Statistics", href: "/college/statistics", icon: "PieChart", comingSoon: true },
        { label: "Export Reports", href: "/college/reports", icon: "Download", comingSoon: true },
      ],
    },
    {
      label: "COMMUNICATION",
      items: [
        { label: "Notifications", href: "/college/notifications", icon: "Bell", comingSoon: true },
        { label: "Announcements", href: "/college/announcements", icon: "Megaphone", comingSoon: true },
        { label: "Feedback", href: "/college/feedback", icon: "MessageSquare", comingSoon: true },
      ],
    },
    {
      label: "SETTINGS",
      items: [
        { label: "Placement Rules", href: "/college/placement-rules", icon: "Settings", comingSoon: true },
        { label: "Institution Settings", href: "/college/settings", icon: "Building", comingSoon: true },
      ],
    },
  ],
};

export const COMMITTEE_NAV: RoleNavigation = {
  role: "placement_committee",
  portalLabel: "Placement Committee",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/committee/dashboard", icon: "LayoutDashboard" },
        { label: "Getting Started", href: "/committee/getting-started", icon: "Rocket", comingSoon: true },
        { label: "Alerts", href: "/committee/alerts", icon: "Bell", comingSoon: true },
      ],
    },
    {
      label: "STUDENT DATA (READ-ONLY)",
      items: [
        { label: "Students", href: "/committee/students", icon: "Users", comingSoon: true },
        { label: "Applications", href: "/committee/applications", icon: "FileText", comingSoon: true },
      ],
    },
    {
      label: "SUPPORT",
      items: [
        { label: "Feedback", href: "/committee/feedback", icon: "MessageSquare", comingSoon: true },
      ],
    },
  ],
};

export const SUPER_ADMIN_NAV: RoleNavigation = {
  role: "super_admin",
  portalLabel: "Platform Administration",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Platform Overview", href: "/admin/dashboard", icon: "LayoutDashboard" },
        { label: "Getting Started", href: "/admin/getting-started", icon: "Rocket", comingSoon: true },
      ],
    },
    {
      label: "PLATFORM DIRECTORY",
      items: [
        { label: "Colleges", href: "/admin/colleges", icon: "Building", comingSoon: true },
        { label: "Employers", href: "/admin/employers", icon: "Building2", comingSoon: true },
        { label: "Users", href: "/admin/users", icon: "Users", comingSoon: true },
        { label: "Marketplace", href: "/admin/marketplace", icon: "Store", comingSoon: true },
      ],
    },
    {
      label: "COMMUNICATION & SUPPORT",
      items: [
        { label: "Email Templates", href: "/admin/email-templates", icon: "Mail", comingSoon: true },
        { label: "Feedback Inbox", href: "/admin/feedback", icon: "Inbox", comingSoon: true },
      ],
    },
    {
      label: "OPERATIONS & RISK",
      items: [
        { label: "Onboarding", href: "/admin/onboarding", icon: "UserPlus", comingSoon: true },
        { label: "Error Logs", href: "/admin/errors", icon: "AlertTriangle", comingSoon: true },
        { label: "Audit Reports", href: "/admin/audit", icon: "Shield", comingSoon: true },
        { label: "Settings", href: "/admin/settings", icon: "Settings", comingSoon: true },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Role → Navigation lookup
// ═══════════════════════════════════════════════════════════════════════════

import type { UserRole } from "@/types/auth";

export const ROLE_NAVIGATION: Record<UserRole, RoleNavigation> = {
  student: STUDENT_NAV,
  alumni: ALUMNI_NAV,
  employer: EMPLOYER_NAV,
  college_admin: COLLEGE_ADMIN_NAV,
  placement_committee: COMMITTEE_NAV,
  super_admin: SUPER_ADMIN_NAV,
};

// ═══════════════════════════════════════════════════════════════════════════
// Quick Actions per role
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_QUICK_ACTIONS: Record<UserRole, QuickAction[]> = {
  student: [
    { label: "Browse Drives", href: "/student/drives", icon: "Target", variant: "primary" },
    { label: "My Internships", href: "/student/internships", icon: "Briefcase" },
    { label: "Mentor Connect", href: "/student/mentors", icon: "Users" },
    { label: "Alerts", href: "/student/notifications", icon: "Bell" },
    { label: "My Profile", href: "/student/profile", icon: "User" },
  ],
  alumni: [
    { label: "Browse Alumni Jobs", href: "/alumni/jobs", icon: "Briefcase", variant: "primary" },
    { label: "My Alumni Jobs", href: "/alumni/my-jobs", icon: "FileText" },
    { label: "Alerts", href: "/alumni/notifications", icon: "Bell" },
    { label: "My Profile", href: "/alumni/profile", icon: "User" },
  ],
  employer: [
    { label: "Campus Partnerships", href: "/employer/partnerships", icon: "Handshake", variant: "primary" },
    { label: "Placement Drives", href: "/employer/drives", icon: "Target" },
    { label: "Applications", href: "/employer/applications", icon: "FileText" },
    { label: "Alerts", href: "/employer/alerts", icon: "Bell" },
    { label: "Feedback", href: "/employer/feedback", icon: "MessageSquare" },
  ],
  college_admin: [
    { label: "Students", href: "/college/students", icon: "Users", variant: "primary" },
    { label: "Applications", href: "/college/applications", icon: "FileText" },
    { label: "Alerts", href: "/college/notifications", icon: "Bell" },
    { label: "Feedback", href: "/college/feedback", icon: "MessageSquare" },
  ],
  placement_committee: [
    { label: "Students", href: "/committee/students", icon: "Users", variant: "primary" },
    { label: "Applications", href: "/committee/applications", icon: "FileText" },
    { label: "Alerts", href: "/committee/alerts", icon: "Bell" },
  ],
  super_admin: [
    { label: "Colleges", href: "/admin/colleges", icon: "Building", variant: "primary" },
    { label: "Employers", href: "/admin/employers", icon: "Building2" },
    { label: "Users", href: "/admin/users", icon: "Users" },
    { label: "Feedback", href: "/admin/feedback", icon: "Inbox" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Demo accounts
// ═══════════════════════════════════════════════════════════════════════════

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: UserRole;
}

export const DEMO_ACCOUNTS: { category: string; accounts: DemoAccount[] }[] = [
  {
    category: "Students",
    accounts: [
      { label: "Arjun (CSE, 2025)", email: "arjun@demo.placementhub.in", password: "Demo@1234", role: "student" },
      { label: "Sneha (ECE, 2025)", email: "sneha@demo.placementhub.in", password: "Demo@1234", role: "student" },
    ],
  },
  {
    category: "Alumni",
    accounts: [
      { label: "Priya (CSE, 2023)", email: "priya@demo.placementhub.in", password: "Demo@1234", role: "alumni" },
    ],
  },
  {
    category: "Employers",
    accounts: [
      { label: "TechCorp Solutions", email: "hr@techcorp.demo", password: "Demo@1234", role: "employer" },
    ],
  },
  {
    category: "College Admin",
    accounts: [
      { label: "Dr. Rajesh Kumar", email: "admin@iit.demo", password: "Demo@1234", role: "college_admin" },
    ],
  },
  {
    category: "Placement Committee",
    accounts: [
      { label: "Committee Member", email: "committee@iit.demo", password: "Demo@1234", role: "placement_committee" },
    ],
  },
  {
    category: "Super Admin",
    accounts: [
      { label: "Platform Admin", email: "superadmin@placementhub.in", password: "Demo@1234", role: "super_admin" },
    ],
  },
];
