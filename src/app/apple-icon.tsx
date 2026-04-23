import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(145deg, #161b22 0%, #0d1117 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          borderRadius: '40px',
        }}
      >
        {/* Bar chart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '10px',
            height: '90px',
          }}
        >
          <div style={{ width: '28px', height: '52px', background: '#3b82f6', borderRadius: '4px 4px 0 0' }} />
          <div style={{ width: '28px', height: '88px', background: '#f59e0b', borderRadius: '4px 4px 0 0' }} />
          <div style={{ width: '28px', height: '68px', background: '#a78bfa', borderRadius: '4px 4px 0 0' }} />
        </div>
        {/* Label */}
        <div
          style={{
            color: '#8b949e',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '2px',
            fontFamily: 'sans-serif',
          }}
        >
          RANKINGS
        </div>
      </div>
    ),
    size,
  );
}
