/** Satori-compatible logo mark for dynamic icon generation (next/og). */
export function BrandMark({ size }: { size: number }) {
  const outer = Math.round(size * 0.22);
  const lensOuter = Math.round(size * 0.33);
  const lensInner = Math.round(size * 0.125);
  const accent = Math.round(size * 0.055);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#171717",
        borderRadius: outer,
      }}
    >
      <div
        style={{
          width: size * 0.66,
          height: size * 0.66,
          borderRadius: "50%",
          background: "#E20612",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: lensOuter,
            height: lensOuter,
            borderRadius: "50%",
            background: "#171717",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: lensInner,
              height: lensInner,
              borderRadius: "50%",
              background: "#f8f4ef",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: size * 0.1,
            right: size * 0.12,
            width: accent,
            height: accent,
            borderRadius: "50%",
            background: "#FFB800",
          }}
        />
      </div>
    </div>
  );
}
