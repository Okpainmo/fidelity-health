# Missie: client

The web app for Missie, the platform assistant for Fidelity Health, a fictional institution that tracks and protects patients' medical records with partner hospitals. Built with React 19, Vite, Tailwind CSS 4, Redux Toolkit and React Router.

See the [root README](../../README.md) for what Missie is and how to run the whole project.

## Scripts

Run from this folder:

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `bun run dev`     | Start the dev server on `http://localhost:5173` |
| `bun run build`   | Typecheck, then build to `dist/`              |
| `bun run preview` | Serve the built app                           |
| `bun run lint`    | ESLint (see the note under Known issues)      |

## Environment

`.env.development`:

| Variable            | Default                        | Purpose              |
| ------------------- | ------------------------------ | -------------------- |
| `VITE_API_URL_BASE` | `http://localhost:5000/api/v1` | Base URL of the API  |

## Folder structure

```
src/
  main.tsx          Entry: Redux provider + router
  router.tsx        The route table (every page is registered here)
  routes/           One folder per page; layout.tsx files are shared layouts
    auth/           login/, signup/ (signed-out only); components/ for their form frame
    home/           / - the three main actions
    records/        /records (my records); upload/ with its form sections and components
    missie/         Missie's chat: layout.tsx, chat/, components/ (sidebar, composer, messages)
    settings/
    about/
    legal/          Legal overview and its documents (list in documents.ts)
    not-found/      404 page
    error/          Page shown when a route crashes
    layout.tsx      Root layout (scroll restoration)
  components/       Shared components only (used by more than one route), one folder each
  data/             Static data (record types, sample records, form options)
  rtk-base/         Redux Toolkit setup
    store.ts        configureStore, RootState, AppDispatch
    hooks.ts        Typed useAppDispatch / useAppSelector
    provider.tsx    <AppProvider> + session-expiry listener
    slices/         One slice per feature (auth, chat)
  utils/            Small helpers: API client, auth storage, session expiry
  styles/           globals.css (Tailwind, colour tokens, fonts)
```

`routes/` folders only organise files. URLs and layouts are defined in `router.tsx`.

**Where components go:** a component used by only one page or route lives in that route's folder (for example `routes/records/upload/components/`). Only components shared across routes go in `src/components/`. Move a component there once a second route needs it.

**Layouts:**

- **`components/PlatformShell`:** top navigation for home, records, upload and settings.
- **`routes/missie/layout.tsx`:** the chat sidebar.
- **`components/RequireAuth`:** wraps both and handles the sign-in redirect.

### Confirmation dialog

`components/ConfirmModalRoot` is mounted once in `rtk-base/provider.tsx`. Ask for confirmation from anywhere with `await requestConfirmation({ title, message, confirmLabel?, tone? })`; it resolves `true` when the user confirms. Logging out uses it through `utils/useLogout.ts`.

### Page conventions

- **Tab title:** every page renders `<PageTitle title="…" />`. `index.html` has no `<title>` on purpose, so a page without one shows no title.
- **Skip link:** the main content area has `id="main"`, which the public header's "Skip to content" link targets.
- **Scrolling:** the root layout scrolls each new page to the top.
- **Unknown URLs and crashes:** unknown URLs show the 404 page, and a page that crashes shows the error page.

## State management

- Use `useAppDispatch` and `useAppSelector` from `@/rtk-base/hooks`, never the plain react-redux hooks.
- API calls live in slices as `createAsyncThunk<Return, Arg, { rejectValue: string }>`. Each thunk:
  - checks the server's `{ responseMessage, response, error }` response,
  - returns `response` on success,
  - rejects with a readable message, using `extractErrorMessage` from `utils/axiosBase.ts`.
- Each operation has its own loading and error fields in the slice, handled in `extraReducers` (pending, fulfilled, rejected).
- **Missie chat (`chatSlice`):** conversations are loaded from and deleted on the server (`/missie/conversations`). Sending uses the `sendMessage` thunk. Based on the profile's `chatMode` (switched in the chat header), it either streams Missie's reply over a WebSocket (`utils/missieStream.ts`) or fetches it whole from `POST /missie/chat`.

## Account types

- **Two types:** `patient` (default) and `hospital` (medical institutions). The server stores the type on the user, accepts it at `/auth/register`, and returns it at log-in.
- **In the client:** read it with `useAppSelector(selectAccountType)`. Sessions saved before account types existed count as patients.
- **Patients:** view their records, use Missie, and keep their profile up to date.
- **Profiles:** each account has a patient or institution profile stored on the server (`GET`/`PATCH /user/me/profile`), loaded and saved by `rtk-base/slices/profileSlice.ts`. The form field `name`s match the server's fields; `routes/profile/buildPayload.ts` turns the form into the request body.
- **Hospitals:** upload records for **registered** patients (found by name, Fidelity Health ID or phone), browse the records they've submitted, and manage their institution profile.
- **Navigation, home and `/records`:** adapt to the type. `/records/upload` sends patients back to `/records`.

## Records, photos and admin

- **Records (`rtk-base/slices/recordsSlice.ts`):** list, detail, upload (multipart: `data` JSON plus `files`), review and patient search.
  - **Pages:** `routes/records/` (list), `routes/records/detail/` (one record, plus the hospital's review panel) and `routes/records/upload/` (form). `buildRecordPayload.ts` maps the form to the API.
  - **Verification:** hospitals must be verified before they can search patients or upload. `utils/useHospitalVerification.ts` reads the status, and `components/VerificationNotice` explains it.
- **Profile photo:** `routes/profile/components/ProfilePhotoField` uploads straight away, separately from "Save changes".
- **Admin (`/admin`, `rtk-base/slices/adminSlice.ts`):** overview, institutions (verify, decline or reset, plus account status), users and all records.
  - **Access:** `routes/admin/layout.tsx` redirects non-admins; the server checks too.
  - **Filters:** kept in the URL (`?status=pending`), so filtered views can be linked to.
- **File links:** attachment and photo links from the API are signed and expire. Pages refetch rather than caching them.

## Authentication

- **Log in or sign up:** the server returns the user and tokens. They're saved in `localStorage` (keys in `utils/authStorage.ts`), and the server also sets an http-only cookie.
- **Every request:** `utils/axiosBase.ts` sends the cookie (`withCredentials`) plus the `Authorization` and `email` headers.
- **Session expiry:** a 401 on a protected request clears the session, fires a window event, and moves the user to `/login`.
- **Signed-in pages** (chat, settings) are guarded by `components/AppShell`.
- **Login and signup pages** redirect signed-in users to `/chat`, or to the `?next=` path they came from.

## Styling

- **Colours:** tokens in `styles/globals.css`, used as Tailwind colours.
  - **Fidelity Health brand (teal):** `accent`, `accent-hover`, `accent-soft`, `accent-ink`.
  - **Missie, the AI assistant (same teal; separate tokens so it can be restyled later):** `missie`, `missie-hover`, `missie-soft`, `missie-ink`.
  - **Neutrals:** `muted`, `line`, `ink-soft`, `ink-faint`.
  - Use the tokens rather than hex values.
- **Fonts:** Lato is the default. Poppins (`.poppins`) is used for headings. Fonts are loaded from Google Fonts in `index.html`.
- **Icons:** Heroicons v2 via `react-icons/hi2` (outline style, `HiOutline*`).

## Known issues

- `bun run lint` fails because `typescript-eslint` doesn't support TypeScript 7 yet. Typechecking (`bun run build`) works.
