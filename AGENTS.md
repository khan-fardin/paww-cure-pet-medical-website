<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses a current Next.js version with breaking changes. Before changing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# pawwcure Agent Guide

This file is for Codex or any future coding agent working inside this repository.

## Product Rules

- The product name is `pawwcure`.
- Use `user` terminology everywhere. Do not introduce older pet-account terminology in routes, labels, models, copy, or docs unless documenting a legacy mismatch that must be removed.
- The project is mobile-first. Every workflow must be fully usable on mobile before desktop polish.
- Public discovery must remain available without login where intended: `/`, `/about`, `/contact`, `/articles`, `/articles/[slug]`, `/vets`, `/vets/[vetId]`, `/login`, `/register`, `/forgot-password`, and `/apply-as-vet`.
- `/pricing` has been removed. Do not recreate it unless the product direction changes.
- The shared consultation room lives at `/consultation/[id]` outside the user shell.

## Stack

- Next.js App Router with React and TypeScript.
- Tailwind CSS for styling. Do not add plain HTML/CSS pages or `<style>` tags for product UI.
- MongoDB through Mongoose.
- JWT auth with `access_token` and `refresh_token` httpOnly cookies.
- SSLCommerz for payment initiation and callbacks.
- Agora for video/audio consultation and support calls.
- Cloudinary for displayable media and application/profile uploads.
- S3 presigned URLs for private clinical documents.
- Nodemailer service hooks for optional email notifications.
- `pdf-lib` for prescription PDF generation.
- `lucide-react` for icons.

## Architecture Rules

- Keep pages and layouts thin. They can read server data and compose UI, but business rules should live in `lib/services`.
- Route handlers should validate auth, connect to MongoDB, perform small request parsing, and call model/service logic.
- Use `getSession()` or `requireSession()` from `lib/auth/session.ts` for server-side auth. Do not trust client-side role checks for protected data.
- The primary route guard is `proxy.ts`; API routes still need their own session and role checks.
- Mongoose models must use the `mongoose.models.X ?? mongoose.model()` hot-reload pattern.
- Use `dbConnect()` before reading or writing MongoDB.
- Do not use localStorage for auth tokens.
- Keep payment fee calculation centralized in `lib/config/fees.ts`.
- Use Cloudinary for public/display media and S3 for private documents. Do not mix the two without an explicit product/security reason.
- Do not add demo/static data to role dashboards when real models exist. Prefer empty states over fake operational data.

## UI Rules

- Preserve the existing visual language: Plus Jakarta Sans, emerald brand accents, white/slate surfaces, rounded bento cards, and mobile-first layouts.
- Role dashboards should use real profile chips, notifications, accessible touch targets, and scrollable navigation where needed.
- Mobile nav must expose all core actions. Avoid overlays or fixed elements that block lower-page buttons.
- Use icons for compact navigation controls, especially on mobile.
- Keep cards, tables, modals, and forms responsive. Check small screens when touching dashboard or checkout UI.

## Current Core Workflows

- User registration/login/logout/me.
- Vet application through `VetProfile`, including Cloudinary uploads.
- Admin/moderator vet review and approval. Approval must promote the linked `User.role` to `vet`.
- Vet availability management and public vet filtering.
- User booking flow with SSLCommerz sandbox payment redirect.
- SSLCommerz success creates a confirmed consultation, marks payment paid, stores platform fee/vet payout, and notifies user/vet/admin.
- Agora consultation room with persisted consultation chat messages.
- Vet record and prescription creation, including downloadable prescription PDF.
- User record, prescription, payment, support, notification, and review pages.
- Support tickets with moderator replies, direct phone support, notes, timestamps, and optional Agora support room.
- Reviews with helpful votes, reporting, moderation, audit history, and real rating sync.
- Admin analytics, CSV export, role assignment, payment payout marking, and settings overview.

## Editing Workflow

- Read the relevant files before editing. Do not assume the current implementation from memory.
- Use `rg` or `rg --files` for search.
- Use `apply_patch` for manual edits.
- Keep edits scoped to the user request.
- Do not revert unrelated user changes.
- Do not delete generated or dependency folders unless the user explicitly asks and the path is verified inside the workspace.
- When changing shared routes, auth, models, payments, media, or layouts, run:
  - `node node_modules/typescript/bin/tsc --noEmit`
  - `npm.cmd run build`
- For docs-only edits, a build is not required.

## Environment Notes

Required runtime variables are documented in `.env.example`. Never commit real secrets from `.env.local`.

Key groups:

- App/auth: `NEXT_PUBLIC_APP_URL`, `JWT_SECRET`, `MONGODB_URI`
- SSLCommerz: `SSL_Store_ID`, `SSL_Store_Password`
- Agora: `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `NEXT_PUBLIC_AGORA_APP_ID`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- S3/email may exist in services and should be documented if production use is expanded.

## Known Hardening Areas

- Add rate limiting and CSRF protection for cookie-authenticated mutations.
- Add stronger API tests and E2E coverage.
- Harden private media/document delivery.
- Add production payment reconciliation and payout audit fields before real-money launch.
- Add structured logging and error tracking.
