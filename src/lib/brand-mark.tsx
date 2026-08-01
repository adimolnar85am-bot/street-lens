/** Satori-compatible viewfinder mark for PWA / favicon generation. */
export function BrandMark({ size }: { size: number }) {
  const s = size / 100;
  const stroke = Math.max(2, 3.5 * s);
  const corner = 22 * s;
  const cornerLen = 12 * s;
  const cx = size / 2;
  const cy = size / 2;
  const r1 = 19 * s;
  const r2 = 13.5 * s;
  const r3 = 9 * s;
  const tally = 7 * s;
  const pad = size * 0.08;

  const bracket = (flipX: number, flipY: number) => {
    const x = flipX > 0 ? size - pad - cornerLen : pad + cornerLen;
    const y = flipY > 0 ? size - pad - cornerLen : pad + cornerLen;
    const hx = flipX > 0 ? x - cornerLen : x + cornerLen;
    const vy = flipY > 0 ? y - cornerLen : y + cornerLen;
    return (
      <div
        key={`${flipX}-${flipY}`}
        style={{
          position: "absolute",
          left: Math.min(x, hx),
          top: Math.min(y, vy),
          width: Math.abs(hx - x) + stroke,
          height: Math.abs(vy - y) + stroke,
          borderTop: flipY < 0 ? `${stroke}px solid #f8f4ef` : "none",
          borderLeft: flipX < 0 ? `${stroke}px solid #f8f4ef` : "none",
          borderBottom: flipY > 0 ? `${stroke}px solid #f8f4ef` : "none",
          borderRight: flipX > 0 ? `${stroke}px solid #f8f4ef` : "none",
          borderRadius: stroke,
        }}
      />
    );
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        position: "relative",
      }}
    >
      {bracket(-1, -1)}
      {bracket(1, -1)}
      {bracket(-1, 1)}
      {bracket(1, 1)}

      <div
        style={{
          position: "absolute",
          top: pad + 6 * s,
          right: pad + 10 * s,
          width: tally,
          height: tally,
          background: "#FFB800",
          borderRadius: 2 * s,
        }}
      />

      <div
        style={{
          width: r1 * 2,
          height: r1 * 2,
          borderRadius: "50%",
          border: `${Math.max(1.5, 2.2 * s)}px solid #E20612`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: r2 * 2,
            height: r2 * 2,
            borderRadius: "50%",
            border: `${Math.max(1, 1.6 * s)}px solid #E20612`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
          }}
        >
          <div
            style={{
              width: r3 * 1.2,
              height: r3 * 1.2,
              borderRadius: "50%",
              background: "#f8f4ef",
              opacity: 0.35,
              marginLeft: -r3 * 0.25,
              marginTop: -r3 * 0.25,
            }}
          />
        </div>
      </div>
    </div>
  );
}
