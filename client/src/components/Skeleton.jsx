export default function Skeleton({ width = '100%', height = 20, borderRadius = 6, style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      backgroundColor: '#2e2e3e',
      background: 'linear-gradient(90deg, #1e1e2e 25%, #2e2e3e 50%, #1e1e2e 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}