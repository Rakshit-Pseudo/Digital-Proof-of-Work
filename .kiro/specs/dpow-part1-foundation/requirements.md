# Requirements Document

## Introduction

The Digital Proof of Work (DPOW) platform is a full-stack web application that allows students to build and showcase verifiable digital portfolios. Part 1 establishes the core foundation: authentication, user profiles, project/certificate management, and Cloudinary-backed media storage. The platform supports four roles — Student, Verifier, Recruiter, and Admin — with JWT-based auth and a clean MVC backend served by a Next.js 15 frontend.

## Glossary

- **System**: The DPOW platform as a whole
- **Auth_Service**: The backend service responsible for authentication and token management
- **User**: Any registered account in the System
- **Student**: A User with the student role who uploads work and manages a portfolio
- **Verifier**: A User with the verifier role who can validate student submissions
- **Recruiter**: A User with the recruiter role who browses student portfolios
- **Admin**: A User with the admin role who has full system access
- **Profile**: Extended information associated with a User account
- **Project**: A work artifact uploaded by a Student containing metadata, files, and optional GitHub link
- **Certificate**: A credential document uploaded by a Student and stored in Cloudinary
- **JWT**: JSON Web Token used for stateless authentication
- **Access_Token**: A short-lived JWT used to authenticate API requests
- **Refresh_Token**: A long-lived JWT used to issue new Access_Tokens
- **Cloudinary**: The cloud media storage service used for all file uploads
- **API**: The Express.js REST API backend
- **Dashboard**: The student-facing frontend page displaying portfolio summary
- **Zod**: The validation library used for request schema validation on the backend

---

## Requirements

### Requirement 1: User Registration and Email Verification

**User Story:** As a new user, I want to register an account and verify my email address, so that I can securely access the DPOW platform.

#### Acceptance Criteria

1. WHEN a user submits a registration form with a valid name, email, password, and role, THE Auth_Service SHALL create a new User record with a hashed password and send a verification email.
2. WHEN a user submits a registration form with an email that already exists, THE Auth_Service SHALL return a 409 Conflict error with a descriptive message.
3. WHEN a user submits a registration form with invalid data (missing fields, invalid email format, password shorter than 8 characters), THE Auth_Service SHALL return a 422 Unprocessable Entity error listing all validation failures.
4. WHEN a user clicks the email verification link containing a valid token, THE Auth_Service SHALL mark the User account as verified and return a success response.
5. IF a user clicks an email verification link containing an expired or invalid token, THEN THE Auth_Service SHALL return a 400 Bad Request error with an explanation.

---

### Requirement 2: Login and Token Management

**User Story:** As a registered user, I want to log in and receive secure tokens, so that I can authenticate subsequent API requests without re-entering credentials.

#### Acceptance Criteria

1. WHEN a verified user submits valid credentials (email and password), THE Auth_Service SHALL return an Access_Token (15-minute expiry) and a Refresh_Token (7-day expiry) along with the user's role and basic profile data.
2. WHEN a user submits credentials for an unverified account, THE Auth_Service SHALL return a 403 Forbidden error with a message prompting email verification.
3. WHEN a user submits incorrect credentials, THE Auth_Service SHALL return a 401 Unauthorized error without revealing which field is incorrect.
4. WHEN a client sends a valid Refresh_Token to the refresh endpoint, THE Auth_Service SHALL issue a new Access_Token and rotate the Refresh_Token.
5. IF a client sends an expired or tampered Refresh_Token, THEN THE Auth_Service SHALL return a 401 Unauthorized error and invalidate the token.
6. WHEN a user requests logout, THE Auth_Service SHALL invalidate the current Refresh_Token and return a 200 success response.

---

### Requirement 3: Password Reset Flow

**User Story:** As a user who has forgotten their password, I want to receive a reset link by email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user submits a valid registered email to the forgot-password endpoint, THE Auth_Service SHALL send a password-reset email containing a time-limited token (1-hour expiry).
2. WHEN a user submits an email that is not registered, THE Auth_Service SHALL return a 200 OK response without revealing whether the account exists.
3. WHEN a user submits a new password with a valid reset token, THE Auth_Service SHALL hash the new password, update the User record, invalidate the token, and return a 200 success response.
4. IF a user submits a new password with an expired or already-used reset token, THEN THE Auth_Service SHALL return a 400 Bad Request error.

---

### Requirement 4: Role-Based Access Control

**User Story:** As a system operator, I want API routes to enforce role-based permissions, so that users can only perform actions appropriate to their role.

#### Acceptance Criteria

1. WHEN an unauthenticated request is made to a protected endpoint, THE API SHALL return a 401 Unauthorized error.
2. WHEN an authenticated User accesses an endpoint restricted to a different role, THE API SHALL return a 403 Forbidden error.
3. THE API SHALL enforce that only Student role users can create, update, or delete their own Projects and Certificates.
4. THE API SHALL enforce that only Admin role users can access user management endpoints.
5. WHILE a valid Access_Token is present in the Authorization header, THE API SHALL attach the decoded user identity (id, role) to the request context for downstream handlers.

---

### Requirement 5: User Profile Management

**User Story:** As a Student, I want to create and update my profile with education, skills, and an avatar, so that recruiters can view my background.

#### Acceptance Criteria

1. WHEN a Student submits a profile creation request with required fields (headline, bio), THE System SHALL create a Profile record linked to the User and return the created profile.
2. WHEN a Student submits a profile update request, THE System SHALL update only the provided fields and return the updated Profile.
3. WHEN a Student uploads an avatar image (JPEG, PNG, or WebP, max 2 MB), THE System SHALL upload it to Cloudinary and store the returned URL in the Profile record.
4. IF a Student uploads an avatar with an unsupported file type or size exceeding 2 MB, THEN THE System SHALL return a 422 error with a descriptive validation message.
5. WHEN a Student adds or updates education entries (institution, degree, start year, end year), THE System SHALL validate that end year is greater than or equal to start year and persist the entries in the Profile.
6. WHEN a Student adds or updates skills (name, proficiency level), THE System SHALL persist the skills array in the Profile.
7. THE System SHALL calculate and return a profile_completion_percentage (integer 0–100) based on the presence of: avatar, headline, bio, at least one education entry, and at least one skill.

---

### Requirement 6: Project Management

**User Story:** As a Student, I want to create, read, update, and delete projects with file attachments and GitHub links, so that I can showcase my work.

#### Acceptance Criteria

1. WHEN a Student submits a project creation request with required fields (title, description, tech_stack array), THE System SHALL create a Project record linked to the Student's User ID and return the created project.
2. WHEN a Student uploads project files (images or documents, max 10 MB each, up to 5 files), THE System SHALL upload each file to Cloudinary and store the returned URLs in the Project record.
3. IF a Student uploads a project file exceeding 10 MB or exceeding 5 files, THEN THE System SHALL return a 422 error with a descriptive validation message.
4. WHEN a Student includes a github_url in a project submission, THE System SHALL validate that it matches the pattern `https://github.com/{owner}/{repo}` and store it if valid.
5. IF a Student provides a github_url that does not match the required pattern, THEN THE System SHALL return a 422 error.
6. WHEN a Student updates a project, THE System SHALL update only the provided fields, preserving existing file URLs unless new files are uploaded.
7. WHEN a Student deletes a project, THE System SHALL remove the Project record from the database.
8. WHEN any authenticated user requests the list of projects for a given Student, THE System SHALL return a paginated list (default 10 per page) of that Student's projects ordered by creation date descending.

---

### Requirement 7: Certificate Management

**User Story:** As a Student, I want to upload certificate files with metadata, so that verifiers and recruiters can see my credentials.

#### Acceptance Criteria

1. WHEN a Student submits a certificate upload request with required fields (title, issuing_organization, issue_date) and a file (PDF, JPEG, or PNG, max 5 MB), THE System SHALL upload the file to Cloudinary and create a Certificate record linked to the Student's User ID.
2. IF a Student uploads a certificate file with an unsupported format or exceeding 5 MB, THEN THE System SHALL return a 422 error with a descriptive validation message.
3. WHEN a Student provides an optional expiry_date for a certificate, THE System SHALL validate that expiry_date is after issue_date and store it.
4. IF a Student provides an expiry_date that is before or equal to the issue_date, THEN THE System SHALL return a 422 error.
5. WHEN a Student requests deletion of a certificate, THE System SHALL remove the Certificate record from the database.
6. WHEN any authenticated user requests the certificate list for a given Student, THE System SHALL return all certificates for that Student ordered by issue_date descending.

---

### Requirement 8: Security Controls

**User Story:** As a system operator, I want the API to apply standard security hardening, so that the platform is protected against common web threats.

#### Acceptance Criteria

1. THE API SHALL include HTTP security headers on all responses using Helmet middleware.
2. THE API SHALL enforce CORS, allowing only the configured frontend origin.
3. THE API SHALL apply rate limiting of 100 requests per 15-minute window per IP address on authentication endpoints.
4. THE API SHALL apply rate limiting of 200 requests per 15-minute window per IP address on general API endpoints.
5. THE API SHALL hash all passwords using bcrypt with a minimum cost factor of 12 before storing them.
6. THE API SHALL validate all incoming request bodies against Zod schemas and return structured 422 errors for any validation failure.
7. WHEN the API receives a request with a JWT that has been tampered with or uses an invalid signature, THE API SHALL return a 401 Unauthorized error.

---

### Requirement 9: Frontend Authentication Pages

**User Story:** As a user, I want browser-based registration, login, and password-reset pages, so that I can interact with the platform without using raw API calls.

#### Acceptance Criteria

1. THE System SHALL provide a registration page that collects name, email, password, and role, validates inputs client-side using Zod, and submits to the backend registration endpoint.
2. THE System SHALL provide a login page that collects email and password, submits to the backend login endpoint, stores the Access_Token and Refresh_Token securely, and redirects to the Dashboard on success.
3. THE System SHALL provide a forgot-password page and a reset-password page that communicate with the corresponding backend endpoints.
4. WHEN a login or registration request fails, THE System SHALL display the backend error message to the user without exposing raw stack traces.
5. WHEN a user's Access_Token expires, THE System SHALL automatically attempt token refresh using the Refresh_Token before retrying the original request.

---

### Requirement 10: Frontend Dashboard and Portfolio Pages

**User Story:** As a Student, I want a dashboard, profile page, and upload pages, so that I can manage my portfolio from the browser.

#### Acceptance Criteria

1. THE System SHALL provide a protected Student Dashboard page that displays the Student's name, profile_completion_percentage, project count, and certificate count.
2. WHEN an unauthenticated user navigates to a protected frontend route, THE System SHALL redirect them to the login page.
3. THE System SHALL provide a Profile page where a Student can view and edit profile fields (headline, bio, avatar, education, skills) and submit updates to the backend.
4. THE System SHALL provide a Project Upload page with a form for creating a new project including title, description, tech_stack, github_url, and file uploads.
5. THE System SHALL provide a Certificate Upload page with a form for uploading a certificate including title, issuing_organization, issue_date, optional expiry_date, and file upload.
6. WHEN a file upload is in progress, THE System SHALL display a loading indicator to the user.
