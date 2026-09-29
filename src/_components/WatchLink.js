'use client';
import Link from 'next/link';

/**
 * A Link that tells LoadingBar a navigation started.
 *
 * The destination (e.g. a /watch page) fetches its data on the server, so
 * without this the old page just sits there with no feedback until the new
 * one arrives. LoadingBar hides itself on `nav:end`, which it fires when the
 * pathname changes.
 *
 * Modifier/middle clicks open a new tab — the pathname here never changes,
 * so those must not start the bar or it would stick forever.
 */
export function notifyNavStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nav:start'));
  }
}

export default function WatchLink({ onClick, ...props }) {
  return (
    <Link
      {...props}
      onClick={e => {
        if (
          e.button === 0 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          notifyNavStart();
        }
        onClick?.(e);
      }}
    />
  );
}
