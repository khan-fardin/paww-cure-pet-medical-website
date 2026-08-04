# pawwcure Architecture

Last scanned: 2026-08-05

## Overview

`pawwcure` is a mobile-first veterinary consultation platform built as one unified Next.js application. It contains public discovery pages, authenticated role dashboards, backend route handlers, MongoDB models, service integrations, payment callbacks, video/audio consultation rooms, support workflows, review moderation, and admin operations in the same codebase.

The application is currently at MVP/product-build stage. The main workflows exist against real MongoDB data, while production hardening is still needed for payments, private media delivery, testing, observability, and abuse protection.

## Technology Stack

| Area | Implementation |
| --- | --- |
| Framework | Next.js App Router, React 19, TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB through Mongoose |
| Auth | JWT in httpOnly `access_token` and `refresh_token` cookies |
| Payments | SSLCommerz sandbox flow |
| Video/audio | Agora |
| Chat | Persisted MongoDB chat messages for consultations |
| Display media | Cloudinary signed uploads |
| Private documents | S3 presigned upload/download service |
| Notifications | MongoDB notification model plus notification bar |
| Email | Nodemailer service hooks |
| PDFs | `pdf-lib` prescription PDF generation |
| Icons | `lucide-react` |

## Route Architecture

The app uses route groups to separate public pages, role shells, and shared real-time rooms without changing URL paths.

### Public Routes

Public routes use `app/(public)/layout.tsx` with the public navigation and footer.

- `/`
- `/about`
- `/contact`
- `/articles`
- `/articles/[slug]`
- `/apply-as-vet`
- `/forgot-password`
- `/login`
- `/register`
- `/vets`
- `/vets/[vetId]`

### User Routes

User dashboard routes live in `app/(user)` and use `components/user/UserShell.tsx`.

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

### Vet Routes

Vet routes live in `app/(vet)/vet` and use `components/vet/VetShell.tsx`.

- `/vet/dashboard`
- `/vet/availability`
- `/vet/consultations`
- `/vet/consultations/[id]`
- `/vet/consultations/[id]/record`
- `/vet/earnings`
- `/vet/patients`
- `/vet/profile`
- `/vet/reviews`

### Moderator Routes

Moderator routes live in `app/(mod)/mod` and use `components/mod/ModShell.tsx`.

- `/mod/dashboard`
- `/mod/consultations`
- `/mod/content`
- `/mod/flags`
- `/mod/tickets`
- `/mod/vets`

### Admin Routes

Admin routes live in `app/(admin)/admin` and use `components/admin/AdminShell.tsx`.

- `/admin/dashboard`
- `/admin/analytics`
- `/admin/content`
- `/admin/payments`
- `/admin/review-audit`
- `/admin/roles`
- `/admin/settings`
- `/admin/users`
- `/admin/vets`

### Shared Authenticated Routes

These routes are outside the role shells because more than one role may use them.

- `/consultation/[id]`
- `/consultation/[id]/waiting`
- `/consultation/[id]/summary`
- `/support-call/[id]`

## Auth and RBAC

The route guard is implemented in `proxy.ts`.

Public paths are allowed without token. API routes are also allowed through the proxy and must enforce auth inside each handler.

Role home paths:

| Role | Home |
| --- | --- |
| `user` | `/dashboard` |
| `vet` | `/vet/dashboard` |
| `mod` | `/mod/dashboard` |
| `admin` | `/admin/dashboard` |

Role route prefixes:

| Role | Prefixes |
| --- | --- |
| `user` | `/dashboard`, `/pets`, `/book`, `/consultations`, `/documents`, `/reminders`, `/payments`, `/support`, `/my-reviews`, `/profile` |
| `vet` | `/vet` |
| `mod` | `/mod` |
| `admin` | `/admin` |

Shared authenticated prefixes are `/consultation`, `/support-call`, `/settings`, `/notifications`, and `/vets`.

Server-side session helpers are in `lib/auth/session.ts`:

- `getSession()` reads `access_token`, falls back to `refresh_token`, and returns `null` on failure.
- `requireSession(roles?)` returns the token payload or throws `Unauthorized` / `Forbidden`.

JWT signing and verification are in `lib/auth/jwt.ts`. Password hashing is in `lib/auth/hash.ts`.

## Database Layer

MongoDB connection is centralized in `lib/db/connect.ts`. It uses a global Mongoose connection cache for hot reload and requires `MONGODB_URI`.

Models live in `lib/db/models` and use the hot-reload-safe `mongoose.models.X ?? mongoose.model()` pattern.

| Model | Purpose |
| --- | --- |
| `User` | Account identity, role, auth fields, phone, avatar, active status |
| `VetProfile` | Vet application, approval, specialties, fee, clinic location, documents, availability |
| `Pet` | User pet records, species, breed, weight, health metadata, avatar |
| `Booking` | Pre-payment booking intent and selected slot |
| `Payment` | SSLCommerz transaction, gross amount, platform fee, vet payout, payout status |
| `Consultation` | Confirmed session, pet/user/vet relationship, status, fee/payment fields |
| `ChatMessage` | Persisted consultation chat messages |
| `Prescription` | Medication, dosage, instructions, expiry, vet/pet/consultation relationship |
| `Document` | Private clinical/document metadata and storage keys |
| `Reminder` | User reminders for medicine, vaccination, follow-up, and related tasks |
| `Notification` | Role/user notifications with read state |
| `Review` | User feedback, helpful votes, reports, vet response, visibility |
| `ReviewAudit` | Moderation audit trail for reported/hidden/restored reviews |
| `Ticket` | User support ticket, moderator assignment, messages, notes, call timestamps |
| `Article` | Public/content article records |

## Service Layer

Business and integration logic lives in `lib/services`.

| Service | Responsibility |
| --- | --- |
| `sslcommerz.service.ts` | Payment initialization, callback URL setup, transaction validation |
| `booking-payment.service.ts` | SSLCommerz callback processing, payment completion, consultation creation, notifications |
| `agora.service.ts` | Agora RTC token generation for consultations and support calls |
| `notification.service.ts` | Create user/role notifications and optional email dispatch |
| `email.service.ts` | Nodemailer notification email helper |
| `prescription-pdf.service.ts` | Industry-style prescription PDF generation |
| `review.service.ts` | Synchronize vet rating totals from visible reviews |
| `s3.service.ts` | Presigned upload/read URLs for private documents |

Configuration lives in `lib/config`.

- `fees.ts` centralizes the platform commission rate and payment split.
- `cloudinary.ts` configures Cloudinary server credentials.

Small reusable helpers live in `lib/utils`, and client fetch hooks live in `lib/hooks`.

## API Surface

API routes are under `app/api`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Users and Roles

- `PATCH /api/users/me`
- `PATCH /api/admin/users/[id]/role`

### Vets and Availability

- `GET /api/vets`
- `POST /api/vets`
- `GET /api/vets/[id]`
- `PUT /api/vets/[id]`
- `PATCH /api/vets/[id]`
- `GET /api/vets/[id]/availability`
- `PATCH /api/vets/[id]/availability`

### Booking and Payments

- `POST /api/bookings`
- `GET|POST /api/payments/sslcommerz/success`
- `GET|POST /api/payments/sslcommerz/fail`
- `GET|POST /api/payments/sslcommerz/cancel`
- `POST /api/admin/payments/mark-paid`

### Consultations

- `GET /api/consultations`
- `POST /api/consultations`
- `GET /api/consultations/[id]`
- `PUT /api/consultations/[id]`
- `DELETE /api/consultations/[id]`
- `GET|POST /api/consultations/[id]/room`
- `GET|POST /api/consultations/[id]/messages`
- `POST /api/consultations/[id]/record`

### Pets, Records, Documents, Prescriptions

- `GET|POST /api/pets`
- `GET|PUT|DELETE /api/pets/[id]`
- `GET|POST /api/documents`
- `POST /api/documents/presign`
- `GET /api/documents/[id]/download`
- `GET|POST /api/prescriptions`
- `GET /api/prescriptions/[id]/pdf`

### Media

- `POST /api/media/sign`
- `GET /api/media/view`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications`

### Reviews

- `GET|POST /api/reviews`
- `PATCH /api/reviews/[id]`

### Support

- `GET|POST /api/tickets`
- `GET|PATCH /api/tickets/[id]`
- `GET /api/tickets/[id]/room`

### Admin Analytics

- `GET /api/admin/analytics/export`

## Core Workflows

### Registration and Login

Users register and log in through public pages. Successful login stores JWTs in httpOnly cookies. Client code should call `/api/auth/me` for current account display, but authorization must be enforced server-side.

### Vet Application and Approval

1. A logged-in user opens `/apply-as-vet`.
2. The wizard prefills account fields from the existing user account where available.
3. Profile photo and credential files upload through Cloudinary signed upload.
4. Application details save to `VetProfile`.
5. Moderator/admin reviews applications in role dashboards.
6. Approval sets the vet profile to verified/approved and promotes the linked `User.role` from `user` to `vet`.
7. The vet can then access `/vet/*` and manage availability.

### Vet Search and Slot Booking

Public vet search reads real `VetProfile` records. Filter options should be derived from real specialties and clinic cities so the filter labels match actual vet data.

Booking flow:

1. User selects a vet.
2. `/api/vets/[id]/availability` generates real available slots from the vet profile.
3. User selects pet, complaint, slot, and consultation type.
4. `POST /api/bookings` creates a `Booking` and `Payment`, then initiates SSLCommerz.
5. The browser redirects to the gateway URL.

### Payment Completion

SSLCommerz calls the success/fail/cancel routes. Success is handled by `completeSslPayment()`:

1. Find `Payment` by `tranId`.
2. Find linked `Booking`.
3. Validate SSLCommerz transaction.
4. Create `Consultation` with status `scheduled`.
5. Mark `Payment.status` as `paid`.
6. Calculate `platformFee` and `vetPayout` using `lib/config/fees.ts`.
7. Set `payoutStatus` to `pending`.
8. Mark booking `confirmed`.
9. Notify vet, user, and admin.
10. Redirect to `/consultation/[id]`.

Admin payment operations group pending vet payouts and allow manual marking as paid through `/api/admin/payments/mark-paid`.

Users see their own real payment summary and previous payments at `/payments`, including payment status, transaction IDs, vet/pet context, consultation links, and retry links when booking data is available.

### Consultation, Call, and Chat

Confirmed consultations use `/consultation/[id]`, outside the user shell. Agora credentials are requested through `/api/consultations/[id]/room`. The same shared room supports user and vet access.

Consultation chat is stored in `ChatMessage`, exposed through `/api/consultations/[id]/messages`, and rendered by `components/consultation/ChatPanel.tsx`.

Moderators monitor live and upcoming sessions from `/mod/consultations`, including user and doctor contact numbers for operational fallback when a paid session is delayed or blocked.

### Records and Prescriptions

Vets write consultation records from `/vet/consultations/[id]/record`. Prescriptions are saved in MongoDB and can be downloaded as PDFs through `/api/prescriptions/[id]/pdf`.

Users can view health history through:

- `/pets/[petId]/records`
- `/pets/[petId]/prescriptions`

Private attachments use document records and S3 presigned URLs.

### Reviews and Moderation

Users can review vets after consultations. Real review data is shown in public vet profiles, vet review pages, user review history, moderator flags, and admin review audit.

Reviews support:

- Helpful votes.
- User reporting.
- Vet responses.
- Moderator/admin hide/restore actions.
- Rating aggregate sync through `review.service.ts`.

### Support Tickets

Users create support requests at `/support`. Moderators handle them at `/mod/tickets`.

Tickets store:

- User and assigned moderator.
- Subject, category, description, status, and priority.
- Messages.
- Moderator notes.
- Call start/end timestamps.

The current support call path can launch a direct phone call and also has an Agora support room route at `/support-call/[id]`.

### Notifications

Notifications are persisted in MongoDB and exposed through `/api/notifications`.

Notification types include booking, review, support, payment, payout, consultation, reminder, and system events. The notification bar is integrated into role shells and supports read-state updates.

### Media and Documents

Cloudinary is used for browser-displayable media:

- User profile photos.
- Pet avatars.
- Vet profile photos.
- Vet application documents when immediate browser display is needed.

S3 is used for private clinical documents:

- Medical record attachments.
- Prescription/report supporting files.
- Secure download links.

## Data Migration

The migration script is `scripts/migrate-financial-and-review-data.mjs`.

Scripts:

- `npm run migrate:data` performs a dry run.
- `npm run migrate:data:apply` applies changes.

The migration currently backfills:

- `platformFee`, `vetPayout`, and `payoutStatus` on older payments.
- Vet rating totals from visible reviews.
- Production-oriented indexes where implemented by the script/models.

## Environment Variables

`.env.example` currently documents:

- `NEXT_PUBLIC_APP_URL`
- `NODE_ENV`
- `JWT_SECRET`
- `MONGODB_URI`
- `SSL_Store_ID`
- `SSL_Store_Password`
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `NEXT_PUBLIC_AGORA_APP_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Additional service files may also expect AWS/S3 or SMTP variables if those features are enabled in production.

## Loading and Error Boundaries

The app has global and group-specific state files:

- `app/loading.tsx`
- `app/error.tsx`
- `app/global-error.tsx`
- `app/not-found.tsx`
- `app/forbidden/page.tsx`
- `app/unauthorized/page.tsx`
- Role/public/consultation/support-call loading and error files.

Shared visual states live in `components/layout/RouteState.tsx` and `components/layout/RouteErrorState.tsx`.

## Production Readiness Gaps

Before real public launch, prioritize:

- API-level rate limiting for auth, booking, media signing, reviews, support, and role changes.
- CSRF protection for cookie-authenticated mutations.
- Formal audit logs for admin role changes, vet approvals, payout marking, document access, and review moderation.
- Payment reconciliation against SSLCommerz production settlement data.
- Payout receipt/reference fields when admin marks vet payouts as paid.
- Stronger private Cloudinary/S3 delivery policies.
- Structured logging, error tracking, and uptime checks.
- Unit tests for fee calculation, payment completion, review sync, auth, and role changes.
- E2E tests for mobile booking, payment callback, consultation, prescription, review, support ticket, and vet approval.

## Verification Commands

Use these before pushing changes that touch code:

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

For data backfill checks:

```bash
npm run migrate:data
npm run migrate:data:apply
```
