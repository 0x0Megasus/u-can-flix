'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08080a',
          color: '#f5f5f7',
          fontFamily: "'Cairo', Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>U Can Flix ran into a problem</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Reload the page to try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.5rem',
              borderRadius: 9999,
              border: 'none',
              background: '#e50914',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
