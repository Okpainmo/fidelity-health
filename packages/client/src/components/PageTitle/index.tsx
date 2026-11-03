const APP_NAME = 'Fidelity Health';

// Sets the browser tab title. React 19 moves <title> into <head> by itself.
export default function PageTitle({ title }: { title?: string }) {
  return <title>{title ? `${title} · ${APP_NAME}` : APP_NAME}</title>;
}
