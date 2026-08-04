# pawwcure

Veterinary consultation platform built with Next.js.

pawwcure connects pet users with verified vets for booking, payment, video consultation, prescriptions, support, reviews, and operational moderation. The project is currently in MVP/product-build stage: the main user, vet, moderator, and admin workflows exist, with several production hardening tasks still listed below.

## Tech Stack

- **Framework:** Next.js App Router, React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** Mongoose
- **Authentication:** JWT in httpOnly cookies
- **Video/audio:** Agora
- **Payments:** SSLCommerz sandbox flow
- **Media:** Cloudinary direct signed uploads for profile and vet application media
- **Documents:** S3 presigned upload/download flow for private medical documents
- **Email:** Nodemailer service hooks
- **PDF:** `pdf-lib` prescription generation
- **Icons:** `lucide-react`

## Core Product Roles

| Role | Purpose | Main Routes |
| --- | --- | --- |
| User | Pet owner account, pet records, booking, consultation, reviews, support | `/dashboard`, `/pets`, `/book/[vetId]`, `/consultations`, `/support`, `/profile` |
| Vet | Verified provider account, availability, consultations, prescriptions, earnings | `/vet/dashboard`, `/vet/availability`, `/vet/consultations`, `/vet/patients`, `/vet/earnings`, `/vet/reviews` |
| Moderator | Operational support, vet application review, ticket handling, review flags | `/mod/dashboard`, `/mod/vets`, `/mod/tickets`, `/mod/consultations`, `/mod/flags` |
| Admin | Platform control, users, roles, vet approval, payments, review audit | `/admin/dashboard`, `/admin/users`, `/admin/vets`, `/admin/payments`, `/admin/review-audit`, `/admin/roles` |

## Current Progress

### Done

- Public landing page and public navigation.
- Public pages for vets, vet profile, articles, about, contact, login, register, forgot password, and apply-as-vet.
- Mobile-first role shells for user, vet, moderator, and admin.
- JWT login/register/logout/me APIs.
- User pet creation, pet listing, pet profile, records, prescriptions, documents, reminders, payments, profile photo upload.
- Vet application wizard with Cloudinary uploads for profile photo, license scan, and degree certificate.
- Moderator/admin vet review workflow with access to submitted documents.
- Vet approval updates vet profile and promotes the linked user role to `vet`.
- Real vet availability management and slot generation.
- User booking flow that creates pending booking/payment data and redirects to SSLCommerz sandbox.
- SSLCommerz success/fail/cancel callbacks.
- Payment split fields for platform fee, vet payout, and payout status.
- Admin payment page with grouped vet payout visibility and mark-paid action.
- Vet earnings page based on real payment data.
- Agora consultation room for paid/confirmed sessions.
- Shared `/consultation/[id]` route group outside the user shell.
- Vet consultation record/prescription workflow.
- Downloadable prescription PDF generation.
- User health-record and prescription pages.
- Support ticket workflow for users and moderators.
- Moderator ticket actions, direct phone-call support, notes, timestamps, and minimal ticket history modal.
- Notifications model/API/service and notification bar integration.
- Reviews with real data, helpful votes, reports, user review history, vet review page, moderator flags, and admin audit.
- Cloudinary signed upload system for user/vet/pet images and vet application documents.
- S3 presigned document service for private medical documents.
- Data migration script for financial and review backfills.

### In Progress / Needs More Hardening

- Full production-grade payment reconciliation with real SSLCommerz settlement/payout automation.
- Time-limited Cloudinary authenticated delivery for private vet documents.
- Rich email notification templates and retry handling.
- Stronger API-level rate limiting and abuse protection.
- More complete automated test coverage.
- Admin analytics depth and export tools.
- Production observability: structured logs, error tracking, uptime checks.
- Final security review for all private document, consultation, and role-change paths.

## Key User Flows

### Vet Application and Approval

1. A logged-in user opens `/apply-as-vet`.
2. Personal account fields are prefilled from the user account where available.
3. User uploads mandatory profile photo and vet documents through Cloudinary signed uploads.
4. Application data is saved to `VetProfile`.
5. Moderator/admin reviews the application and documents.
6. When approved, the linked `User.role` is changed from `user` to `vet`.
7. The vet can access `/vet/dashboard`, manage availability, and receive bookings.

### Booking and Payment

1. User searches vets at `/vets`.
2. User opens a vet profile and chooses booking.
3. Booking page fetches available slots from `/api/vets/[id]/availability`.
4. User selects pet, slot, consultation type, and confirms.
5. `/api/bookings` creates booking/payment intent data and requests SSLCommerz sandbox payment URL.
6. SSLCommerz calls success/fail/cancel routes.
7. On success, payment is marked paid, consultation is confirmed, vet is notified, and payout accounting is saved.

### Consultation

1. Confirmed users and vets enter the shared `/consultation/[id]` route.
2. The room API returns Agora connection details.
3. Vet can start or join the session from vet consultations.
4. User joins from consultations/waiting flow.
5. After the session, vet writes the record and prescription.
6. User can view records, prescriptions, download PDF, and submit a review.

### Support Ticket

1. User creates a support request from `/support`.
2. Moderator sees the ticket in `/mod/tickets`.
3. Moderator can reply, start phone support, add notes, and close the ticket.
4. Closed ticket history stays minimal until opened in the history modal.

### Reviews

1. User reviews a vet after consultation.
2. Vet rating totals are updated from visible reviews.
3. Public vet profile shows real reviews.
4. Users can view review history.
5. Reviews can be marked helpful or reported.
6. Moderator/admin can audit and moderate review reports.

## Payment Model

The current MVP uses a simple professional payment accounting model:

- User pays consultation fee through SSLCommerz sandbox.
- `Payment.amount` stores gross amount.
- `platformFee` stores pawwcure share.
- `vetPayout` stores amount owed to the vet.
- `payoutStatus` starts as `pending`.
- Admin manually pays the vet outside the app and clicks **Mark as paid**.
- The app updates matching pending payments to `paid`.

This is suitable for MVP testing. For production automated payouts, add gateway-supported disbursement, bank/mobile-wallet KYC, payout failure handling, reconciliation reports, and audit-grade ledger entries.

## Media and Document Storage

### Cloudinary

Used for media that needs browser display:

- User avatar
- Pet avatar
- Vet profile photo
- Vet application license/degree files

Uploads are signed server-side through `/api/media/sign`, then sent directly from the browser to Cloudinary. The app stores the returned URL and public ID in MongoDB.

### S3

Used for private clinical documents:

- Medical attachments
- Record files
- Prescription/report supporting documents

The server creates short-lived presigned upload/read URLs. File bytes do not pass through the Next.js server.

## Important Routes

### Public

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/apply-as-vet`
- `/vets`
- `/vets/[vetId]`
- `/articles`
- `/articles/[slug]`
- `/about`
- `/contact`

### User

- `/dashboard`
- `/profile`
- `/pets`
- `/pets/new`
- `/pets/[petId]`
- `/pets/[petId]/records`
- `/pets/[petId]/prescriptions`
- `/book/[vetId]`
- `/consultations`
- `/documents`
- `/reminders`
- `/payments`
- `/support`
- `/my-reviews`

### Vet

- `/vet/dashboard`
- `/vet/consultations`
- `/vet/consultations/[id]`
- `/vet/consultations/[id]/record`
- `/vet/patients`
- `/vet/availability`
- `/vet/earnings`
- `/vet/profile`
- `/vet/reviews`

### Moderator

- `/mod/dashboard`
- `/mod/vets`
- `/mod/tickets`
- `/mod/consultations`
- `/mod/flags`
- `/mod/content`

### Admin

- `/admin/dashboard`
- `/admin/users`
- `/admin/vets`
- `/admin/payments`
- `/admin/roles`
- `/admin/analytics`
- `/admin/settings`
- `/admin/content`
- `/admin/review-audit`

### Shared

- `/consultation/[id]`
- `/consultation/[id]/waiting`
- `/consultation/[id]/summary`
- `/support-call/[id]`

## API Areas

- `app/api/auth/*` - authentication and current session.
- `app/api/vets/*` - public vet search, profiles, availability, application data.
- `app/api/bookings` - booking initiation and payment redirect creation.
- `app/api/payments/sslcommerz/*` - SSLCommerz callbacks.
- `app/api/admin/payments/mark-paid` - admin payout status update.
- `app/api/consultations/*` - consultation data, Agora room, vet record.
- `app/api/pets/*` - user pet CRUD.
- `app/api/prescriptions/*` - prescriptions and PDF download.
- `app/api/documents/*` - S3 document upload/download.
- `app/api/media/*` - Cloudinary signing and protected media view.
- `app/api/notifications` - notification listing and read actions.
- `app/api/reviews/*` - reviews, helpful votes, reports, moderation.
- `app/api/tickets/*` - support ticket workflow and support call room.
- `app/api/admin/users/[id]/role` - admin role changes.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env.local` and fill the required values.

Required for core app:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=replace-with-at-least-32-characters
MONGODB_URI=mongodb+srv://user:password@cluster.example.mongodb.net/pawwcure
```

### 3. Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 4. Type-check and build

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

### 5. Run data backfill script

Dry run:

```bash
npm run migrate:data
```

Apply changes:

```bash
npm run migrate:data:apply
```

The migration currently backfills financial fields and review/rating aggregates.

## Project Structure

```text
app/
  (public)/          Public marketing/auth/discovery pages
  (user)/            User dashboard and pet workflows
  (vet)/             Vet dashboard and consultation workflows
  (mod)/             Moderator operations
  (admin)/           Admin operations
  (consultation)/    Shared consultation room routes
  (support-call)/    Support call route
  api/               Route handlers

components/
  admin/             Admin UI and actions
  consultation/      Agora room, waiting room, review form
  layout/            Public nav/footer/notification shell
  mod/               Moderator actions and queues
  public/            Landing, auth, vet application
  support/           Support call room
  ui/                Shared input/button/upload primitives
  user/              User shell, forms, support, booking
  vet/               Vet shell, availability, records

lib/
  auth/              JWT, password hash, session helpers
  config/            Service configuration and payment fees
  db/                Mongoose connection and models
  hooks/             Client fetch hooks
  services/          Business/service integrations
  utils/             Small shared helpers

scripts/
  migrate-financial-and-review-data.mjs
```

## Engineering Conventions

- Use TypeScript with strict typing.
- Use App Router route handlers for backend endpoints.
- Keep business logic in `lib/services` where possible.
- Keep database schemas in `lib/db/models`.
- Use Cloudinary for displayable profile/application media.
- Use S3 presigned URLs for private clinical documents.
- Use `user` terminology instead of `owner`.
- Keep mobile layouts fully functional before desktop polish.
- Do not store auth tokens in localStorage.
- Do not pass private file bytes through the Next.js server.

## Production Readiness Checklist

### Security

- Add rate limiting for auth, booking, media signing, reviews, and tickets.
- Add CSRF strategy for cookie-authenticated mutations.
- Harden Cloudinary private asset delivery with short-lived signed delivery URLs.
- Review all role checks at API level, not only page/layout level.
- Add audit logs for admin role changes, vet approvals, payment actions, and document access.

### Payments

- Finalize platform fee policy and make it configurable.
- Verify SSLCommerz production callback signatures.
- Add payment reconciliation screen.
- Add payout receipt fields when admin marks payments as paid.
- Consider proper ledger/wallet model before real automated payouts.

### Reliability

- Add structured logging.
- Add error tracking.
- Add health endpoint.
- Add retry strategy for email and notification delivery.
- Add backup and restore plan for MongoDB.

### Testing

- Unit tests for services and fee calculations.
- API tests for auth, bookings, payments, role changes, reviews, tickets.
- E2E tests for user booking to consultation to review.
- E2E tests for vet approval and role promotion.
- Mobile viewport tests for nav, forms, payment, consultation room.

### UX Polish

- Final empty states for every dashboard.
- Loading and error states for all async panels.
- Better admin/moderator filters and pagination.
- More complete notification preferences.
- Final visual pass for PDF prescription layout.

## Current MVP Status

The application has the main end-to-end skeleton and several real workflows working against MongoDB:

- A user can register, apply as a vet, and upload required media.
- Admin/moderator can review vet applications.
- Approved users become vets in the database.
- Vets can manage availability.
- Users can book vets and pay through sandbox payment flow.
- Confirmed consultations can open an Agora call.
- Vets can write records and prescriptions.
- Users can view records, download prescriptions, and review vets.
- Admin can see payment obligations and mark payouts as paid.
- Moderators can handle support and review reports.

The project is ready for continued MVP completion and controlled internal testing. Before public launch, prioritize payment verification, role/security review, document access hardening, and automated tests.
