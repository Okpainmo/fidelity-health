import { LegalDocument, LegalSection } from '@/routes/legal/components/LegalDocument';

const storage = [
  {
    name: 'Sign-in cookie',
    where: 'Cookie (http-only, secure, same-site strict)',
    purpose: 'Confirms requests come from your signed-in session.',
    lasts: '24 hours',
  },
  {
    name: 'accessToken, refreshToken',
    where: 'Browser local storage',
    purpose: 'Keep you signed in and prove who you are to the server.',
    lasts: 'Until you log out or the session expires',
  },
  {
    name: 'userProfile',
    where: 'Browser local storage',
    purpose: 'Your name, email and basic account details, so the app can show who is signed in.',
    lasts: 'Until you log out or the session expires',
  },
  {
    name: 'sidebarOpen',
    where: 'Browser local storage',
    purpose: 'Remembers whether you closed the chat sidebar.',
    lasts: 'Until you clear your browser data',
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      slug="cookie-policy"
      intro={
        <p>
          Fidelity Health uses one cookie and a few items of browser storage, all needed to keep you signed in or to remember a display preference. There are no
          advertising or analytics cookies.
        </p>
      }
    >
      <LegalSection heading="What we store">
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-foreground">
                <th className="py-2.5 pr-4 pl-1 font-semibold">Name</th>
                <th className="py-2.5 pr-4 font-semibold">Where</th>
                <th className="py-2.5 pr-4 font-semibold">Purpose</th>
                <th className="py-2.5 pr-1 font-semibold">How long</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {storage.map((item) => (
                <tr key={item.name} className="align-top">
                  <td className="py-3 pr-4 pl-1 font-medium text-foreground">{item.name}</td>
                  <td className="py-3 pr-4">{item.where}</td>
                  <td className="py-3 pr-4">{item.purpose}</td>
                  <td className="py-3 pr-1">{item.lasts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection heading="Fonts">
        <p>
          The app loads its fonts from Google Fonts. When it does, your browser connects to Google, which can see your IP address. Google doesn't set cookies
          for this.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <ul>
          <li>Logging out removes the sign-in items from local storage.</li>
          <li>You can clear cookies and site data in your browser settings at any time; you'll need to sign in again.</li>
          <li>Blocking these items will stop sign-in from working, because they're needed to run the service.</li>
        </ul>
      </LegalSection>
    </LegalDocument>
  );
}
