# Requirements Document

## Introduction

The Digital Proof of Work (DPoW) platform is a full-stack web application that enables students to build, manage, and share verifiable digital portfolios of their work. The platform allows students to upload projects and certificates, build detailed profiles, and be discoverable by recruiters and verifiers. The system supports four distinct roles — Student, Verifier, Recruiter, and Admin — each with tailored access controls. Part 1 focuses on the core foundation: authentication, user profiles, projects, certificates, and the API layer that underpins all future features.

## Glossary

- **System**: The Digital Proof of Work platform as a whole
- **Auth_Service**: The component responsible for authentication and authorization
- **Token_Service**: The component responsible for issuing and validating JWT access and refresh tokens
- **User**: A registered account in the system
- **Student**: A User with the Student role who submits projects and certificates
- **Verifier**: A User with the Verifier role who can review and validate Student submissions
- **Recruiter**: A User with the Recruiter role who can browse Student profiles and work
- **Admin**: A User with the Admin role who manages the platform and all users
- **Profile**: A structured record associated with a User containing personal, educational, and skill information
- **Project**: A work artifact submitted by a Student including description, files, and optional GitHub link
- **Certificate**: A credential document submitted by a Student, stored as a file
- **Media_Service**: The component responsible for uploading and managing files via Cloudinary
- **Cloudinary**: The third-party cloud media storage service used for all file uploads
- **MongoDB**: The NoSQL database used to persist all application data
- **API**: The RESTful HTTP interface exposing all backend functionality
- **Middleware**: Server-side logic executed between receiving a request and invoking a controller
- **Rate_Limiter**: The Middleware component that restricts request frequency per client
- **Validator**: The component responsible for validating request inputs against defined schemas
- **Dashboard**: The Student-facing UI page that provides an overview of the Student's portfolio

---

## Requirements

### Requirement 1: User Registration and Email Verification

**User Story:** As a new user, I want to register an account and verify my email address, so that I can access the platform with a confirmed identity.

#### Acceptance Criteria

1. WHEN a registration request is received with a valid email, password, full name, and role, THE Auth_Service SHALL create a new User record with a hashed password and an `unverified` email status.
2. WHEN a User record is created, THE Auth_Service SHALL send a verification email containing a time-limited token to the registered email address.
3. WHEN a verification request is received with a valid and unexpired token, THE Auth_Service SHALL update the User's email status to `verified`.
4. IF a registration request contains an email address already associated with an existing User, THEN THE Auth_Service SHALL return a conflict error response.
5. IF a registration request is missing required fields or contains an invalid email format, THEN THE Validator SHALL return a validation error response listing the specific invalid fields.
6. IF a verification request contains an expired or invalid token, THEN THE Auth_Service SHALL return an error response indicating the token is invalid or expired.
7. WHEN a User requests a new verification email, THE Auth_Service SHALL invalidate any existing verification tokens for that User and issue a new one.

---

### Requirement 2: User Login and JWT Token Management

**User Story:** As a registered user, I want to log in with my credentials and receive authentication tokens, so that I can make authenticated API requests.

#### Acceptance Criteria

1. WHEN a login request is received with a valid email and correct password for a verified User, THE Auth_Service SHALL return a signed JWT access token and a signed JWT refresh token.
2. WHEN a login request is received for a User whose email is not verified, THE Auth_Service SHALL return an error response indicating email verification is required.
3. IF a login request contains an email not associated with any User, THEN THE Auth_Service SHALL return a generic invalid credentials error response.
4. IF a login request contains an incorrect password, THEN THE Auth_Service SHALL return a generic invalid credentials error response.
5. THE Token_Service SHALL issue access tokens with an expiry of 15 minutes.
6. THE Token_Service SHALL issue refresh tokens with an expiry of 7 days.
7. WHEN a token refresh request is received with a valid and unexpired refresh token, THE Token_Service SHALL return a new access token and a new refresh token.
8. IF a token refresh request contains an expired or invalid refresh token, THEN THE Token_Service SHALL return an unauthorized error response.
9. WHEN a logout request is received with a valid refresh token, THE Auth_Service SHALL invalidate that refresh token so it cannot be reused.

---

### Requirement 3: Forgot Password and Password Reset

**User Story:** As a user who has forgotten their password, I want to receive a reset link by email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a forgot-password request is received with a registered email address, THE Auth_Service SHALL send a password reset email containing a time-limited reset token.
2. IF a forgot-password request contains an email address not associated with any User, THEN THE Auth_Service SHALL return a generic success response to prevent email enumeration.
3. WHEN a password reset request is received with a valid and unexpired reset token and a new password meeting complexity rules, THE Auth_Service SHALL update the User's password to the hashed new password and invalidate the reset token.
4. IF a password reset request contains an expired or invalid reset token, THEN THE Auth_Service SHALL return an error response indicating the token is invalid or expired.
5. IF a password reset request contains a new password shorter than 8 characters or lacking at least one uppercase letter, one lowercase letter, and one digit, THEN THE Validator SHALL return a validation error response.
6. WHEN a password is successfully reset, THE Auth_Service SHALL invalidate all existing refresh tokens for that User.

---

### Requirement 4: Role-Based Access Control

**User Story:** As a platform operator, I want access to resources restricted by user role, so that each role can only perform actions appropriate to their permissions.

#### Acceptance Criteria

1. THE System SHALL support exactly four roles: `student`, `verifier`, `recruiter`, and `admin`.
2. WHEN an authenticated request is received, THE Middleware SHALL extract the role from the verified JWT and attach it to the request context.
3. WHEN a request targets a route restricted to the `admin` role and the requesting User's role is not `admin`, THE Middleware SHALL return a forbidden error response.
4. WHEN a request targets a route restricted to `student` and the requesting User's role is not `student`, THE Middleware SHALL return a forbidden error response.
5. WHEN a request targets a route accessible to `verifier` or `recruiter` roles and the requesting User holds neither role, THE Middleware SHALL return a forbidden error response.
6. IF a request reaches a protected route without a valid JWT, THEN THE Middleware SHALL return an unauthorized error response.

---

### Requirement 5: User Profile Management

**User Story:** As a student, I want to create and update my profile with personal information, education, and skills, so that recruiters and verifiers can understand my background.

#### Acceptance Criteria

1. WHEN a profile creation request is received from an authenticated Student with valid profile data, THE System SHALL create a Profile record associated with that Student's User ID.
2. THE System SHALL allow each User to have at most one associated Profile record.
3. WHEN a profile update request is received from an authenticated Student with valid partial or full profile data, THE System SHALL update the corresponding Profile record with the provided fields.
4. WHEN a profile retrieval request is received for a valid User ID, THE System SHALL return the associated Profile record.
5. THE System SHALL calculate and store a profile completion percentage based on the number of populated optional fields out of the total optional fields defined in the Profile schema.
6. WHEN a profile update is saved, THE System SHALL recalculate and update the profile completion percentage.
7. IF a profile creation or update request contains fields that fail validation rules, THEN THE Validator SHALL return a validation error response listing the specific invalid fields.

---

### Requirement 6: Avatar Upload

**User Story:** As a student, I want to upload a profile picture, so that my profile has a recognizable visual identity.

#### Acceptance Criteria

1. WHEN an avatar upload request is received from an authenticated User with a valid image file, THE Media_Service SHALL upload the file to Cloudinary and return the hosted URL.
2. WHEN an avatar is successfully uploaded, THE System SHALL update the User's Profile record with the Cloudinary URL of the new avatar.
3. THE Media_Service SHALL accept avatar files in JPEG, PNG, and WebP formats only.
4. THE Media_Service SHALL reject avatar files exceeding 5 MB in size.
5. IF an avatar upload request contains a file in an unsupported format or exceeding the size limit, THEN THE Media_Service SHALL return a validation error response before attempting the Cloudinary upload.
6. WHEN a new avatar is uploaded for a User who already has an avatar, THE Media_Service SHALL delete the previous avatar from Cloudinary before storing the new URL.

---

### Requirement 7: Education and Skills Management

**User Story:** As a student, I want to add my education history and a list of skills to my profile, so that my academic background and competencies are visible.

#### Acceptance Criteria

1. WHEN a request is received to add an education entry with institution name, degree, field of study, and graduation year, THE System SHALL append the entry to the Student's Profile education list.
2. WHEN a request is received to remove an education entry by its ID, THE System SHALL remove the matching entry from the Student's Profile education list.
3. WHEN a request is received to add a skill with a name and optional proficiency level, THE System SHALL append the skill to the Student's Profile skills list.
4. WHEN a request is received to remove a skill by its ID, THE System SHALL remove the matching skill from the Student's Profile skills list.
5. IF an education entry is missing required fields, THEN THE Validator SHALL return a validation error response.
6. THE System SHALL allow a Student to have at most 20 education entries and at most 50 skills in their Profile.

---

### Requirement 8: Project Management

**User Story:** As a student, I want to create, update, and delete projects in my portfolio, so that I can showcase my work to verifiers and recruiters.

#### Acceptance Criteria

1. WHEN a project creation request is received from an authenticated Student with a title, description, and at least one file or GitHub link, THE System SHALL create a Project record associated with that Student's User ID.
2. WHEN a project file upload request is received, THE Media_Service SHALL upload the file to Cloudinary and store the returned URL in the Project record.
3. THE Media_Service SHALL accept project files in PDF, PNG, JPEG, and WebP formats, with a maximum size of 10 MB per file.
4. THE System SHALL allow a maximum of 5 files per Project.
5. WHEN a project update request is received from the owning Student with valid data, THE System SHALL update the Project record with the provided fields.
6. WHEN a project deletion request is received from the owning Student, THE System SHALL delete the Project record and remove all associated files from Cloudinary.
7. WHEN a project listing request is received for a valid Student User ID, THE System SHALL return all Project records associated with that Student.
8. WHEN a single project retrieval request is received for a valid project ID, THE System SHALL return the corresponding Project record.
9. IF a project creation or update request fails validation, THEN THE Validator SHALL return a validation error response.
10. IF a request to update or delete a Project is received from a User who is not the project owner and does not hold the `admin` role, THEN THE Middleware SHALL return a forbidden error response.
11. WHERE a GitHub link is provided in a project submission, THE Validator SHALL verify the value is a valid URL before saving.

---

### Requirement 9: Certificate Management

**User Story:** As a student, I want to upload and manage my certificates, so that my credentials are stored and accessible on my profile.

#### Acceptance Criteria

1. WHEN a certificate upload request is received from an authenticated Student with a title and a valid file, THE System SHALL create a Certificate record and upload the file to Cloudinary.
2. THE Media_Service SHALL accept certificate files in PDF, PNG, and JPEG formats only, with a maximum size of 10 MB per file.
3. WHEN a certificate deletion request is received from the owning Student, THE System SHALL delete the Certificate record and remove the associated file from Cloudinary.
4. WHEN a certificate listing request is received for a valid Student User ID, THE System SHALL return all Certificate records associated with that Student.
5. IF a certificate upload request contains a file in an unsupported format or exceeding the size limit, THEN THE Media_Service SHALL return a validation error response.
6. IF a request to delete a Certificate is received from a User who is not the certificate owner and does not hold the `admin` role, THEN THE Middleware SHALL return a forbidden error response.

---

### Requirement 10: API Security

**User Story:** As a platform operator, I want the API to enforce security best practices, so that the system is protected against common web vulnerabilities.

#### Acceptance Criteria

1. THE System SHALL apply HTTP security headers to all API responses using a security header Middleware.
2. THE System SHALL restrict cross-origin requests to a configurable list of allowed origins.
3. THE Rate_Limiter SHALL limit each client IP to 100 requests per 15-minute window on general API routes.
4. THE Rate_Limiter SHALL limit each client IP to 10 requests per 15-minute window on authentication routes.
5. WHEN a client exceeds the rate limit, THE Rate_Limiter SHALL return a 429 Too Many Requests response.
6. THE System SHALL hash all passwords using bcrypt with a minimum cost factor of 12 before storage.
7. THE Validator SHALL sanitize all string inputs to prevent injection of executable content.
8. THE Token_Service SHALL sign all JWTs using a secret key of at least 256 bits loaded from environment configuration.

---

### Requirement 11: Frontend Authentication Pages

**User Story:** As a user, I want functional login, registration, and password reset pages, so that I can access and manage my account from a browser.

#### Acceptance Criteria

1. THE System SHALL provide a registration page with form fields for full name, email, password, confirm password, and role selection.
2. THE System SHALL provide a login page with form fields for email and password.
3. THE System SHALL provide a forgot-password page with a form field for email.
4. THE System SHALL provide a reset-password page that accepts a reset token from the URL and form fields for new password and confirm password.
5. WHEN a form is submitted with invalid data, THE System SHALL display inline validation error messages adjacent to the relevant fields without submitting the request.
6. WHEN an API request is in progress from a form submission, THE System SHALL display a loading state on the submit button and disable the form.
7. WHEN an authentication API call returns an error, THE System SHALL display a descriptive error message to the user.
8. WHEN a login is successful, THE System SHALL redirect the authenticated User to the Student Dashboard.
9. WHEN a registration is successful, THE System SHALL redirect the User to a page informing them to verify their email.

---

### Requirement 12: Student Dashboard Shell

**User Story:** As a student, I want a dashboard overview page, so that I can navigate to my profile, projects, and certificates from one place.

#### Acceptance Criteria

1. THE System SHALL provide a Student Dashboard page accessible only to authenticated Users with the `student` role.
2. WHEN an unauthenticated User navigates to a protected route, THE System SHALL redirect them to the login page.
3. THE System SHALL display navigation links to the Profile page, Projects page, and Certificates page within the Dashboard layout.
4. THE System SHALL display the Student's name and profile completion percentage on the Dashboard.
5. THE System SHALL display summary counts of the Student's total projects and total certificates on the Dashboard.

---

### Requirement 13: Profile, Project, and Certificate Pages

**User Story:** As a student, I want dedicated pages for managing my profile, projects, and certificates, so that I can maintain my portfolio through the UI.

#### Acceptance Criteria

1. THE System SHALL provide a Profile page where an authenticated Student can view and edit their profile fields including bio, education, and skills.
2. THE System SHALL provide a Project upload page where an authenticated Student can create a new project by entering a title, description, optional GitHub link, and uploading up to 5 files.
3. THE System SHALL provide a Certificates page where an authenticated Student can view all uploaded certificates and upload new ones.
4. WHEN a profile update form is submitted successfully, THE System SHALL display a success notification and reflect the updated data in the UI without a full page reload.
5. WHEN a project or certificate is uploaded successfully, THE System SHALL display it in the respective list immediately after upload.
6. WHEN a project or certificate deletion is confirmed by the User, THE System SHALL remove it from the list immediately upon successful API response.
