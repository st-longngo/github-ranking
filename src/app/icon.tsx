import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Bar chart ranking icon — #1 bar tallest (gold), #2 left (blue), #3 right (purple)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d1117',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '5px 5px 4px',
          gap: '3px',
          borderRadius: '7px',
        }}
      >
        <div style={{ width: '6px', height: '10px', background: '#3b82f6', borderRadius: '1px 1px 0 0' }} />
        <div style={{ width: '6px', height: '18px', background: '#f59e0b', borderRadius: '1px 1px 0 0' }} />
        <div style={{ width: '6px', height: '13px', background: '#a78bfa', borderRadius: '1px 1px 0 0' }} />
      </div>
    ),
    size,
  );
}
