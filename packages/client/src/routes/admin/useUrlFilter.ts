import { useSearchParams } from 'react-router';

/** A filter kept in the URL (?name=value), so filtered views can be linked to. */
export function useUrlFilter<T extends string>(name: string, allowed: readonly T[], fallback: T): [T, (value: T) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(name);
  const value = allowed.includes(raw as T) ? (raw as T) : fallback;

  function setValue(next: T) {
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        if (next === fallback) updated.delete(name);
        else updated.set(name, next);
        return updated;
      },
      { replace: true },
    );
  }

  return [value, setValue];
}
