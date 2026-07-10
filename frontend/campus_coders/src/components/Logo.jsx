import React from 'react';

export default function Logo({ size = 40, showText = false, layout = 'stacked', theme = 'dark' }) {
  // Center of our SVG
  const x0 = 115;
  const y0 = 100;

  // We define 4 rings of dots forming the "C" shape
  const rings = [
    { radius: 51, baseDotR: 5.2, startAngle: 55, endAngle: 310, step: 11 },
    { radius: 40, baseDotR: 4.2, startAngle: 60, endAngle: 310, step: 11 },
    { radius: 30, baseDotR: 3.2, startAngle: 70, endAngle: 300, step: 13 },
    { radius: 20, baseDotR: 2.8, startAngle: 70, endAngle: 290, step: 18 },
  ];

  const dots = [];

  rings.forEach((ring, ringIdx) => {
    const { radius, baseDotR, startAngle, endAngle, step } = ring;
    
    for (let angle = startAngle; angle <= endAngle; angle += step) {
      const rad = (angle * Math.PI) / 180;
      const x = x0 + radius * Math.cos(rad);
      const y = y0 + radius * Math.sin(rad);

      // Distance from the back of the C (180 degrees)
      const distFromCenterAngle = Math.abs(angle - 180);
      const maxDist = 180 - startAngle;
      const factor = Math.max(0.3, 1 - distFromCenterAngle / maxDist);
      const dotR = baseDotR * (0.4 + 0.6 * factor);

      const delay = (ringIdx * 0.15) + ((angle - startAngle) / 360) * 0.5;

      dots.push({
        key: `${ringIdx}-${angle}`,
        cx: x,
        cy: y,
        r: dotR,
        delay: delay
      });
    }
  });

  // Text color based on theme
  const campusColor = theme === 'dark' ? '#FFFFFF' : '#0F1115';
  const codersColor = '#D4AF37'; // Gold
  const tagColor = '#D4AF37';

  // SVG Render Helper focused on the logo coordinates by cropping outer margins
  const renderSvg = (isIconOnly = false) => {
    const gradId = isIconOnly ? "goldRadialIcon" : "goldRadial";
    return (
      <svg
        width="100%"
        height="100%"
        viewBox="40 40 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={gradId} cx="100" cy="100" r="50" fx="90" fy="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE08A" />
            <stop offset="60%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#D4AF37" />
          </radialGradient>
        </defs>
        
        <g>
          {dots.map(dot => (
            <circle
              key={dot.key}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill={`url(#${gradId})`}
            />
          ))}
        </g>
      </svg>
    );
  };

  // 1. Text Layouts (stacked or inline)
  if (showText) {
    if (layout === 'inline') {
      return (
        <div className="brand-logo-container" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {/* Black container box for logo icon - padding reduced to 8% to make icon look much bigger */}
          <div style={{
            // backgroundColor: '#0F1115',
            // borderRadius: '6px',
            width: `${size}px`,
            height: `${size}px`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            // padding: '2px',
            flexShrink: 0,
            // boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            {renderSvg(false)}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: `${size * 0.45}px`,
              letterSpacing: '-0.02em',
            }}>
              <span style={{ color: campusColor }}>Campus</span>
              <span style={{ color: codersColor }}>Coders</span>
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: `${size * 0.16}px`,
              letterSpacing: '0.25em',
              color: tagColor,
              textTransform: 'uppercase',
              marginTop: '1px',
              opacity: 0.9
            }}>
              Code • Collaborate • Grow
            </span>
          </div>
        </div>
      );
    }

    // Stacked layout
    return (
      <div className="brand-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          backgroundColor: '#0F1115',
          borderRadius: '16px',
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {renderSvg(false)}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: `${size * 0.45}px`,
            letterSpacing: '-0.02em',
            color: campusColor
          }}>Campus</span>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: `${size * 0.45}px`,
            letterSpacing: '-0.02em',
            color: codersColor
          }}>Coders</span>
          
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: `${size * 0.16}px`,
            letterSpacing: '0.3em',
            color: tagColor,
            textTransform: 'uppercase',
            marginTop: '4px',
            opacity: 0.9
          }}>
            CODE • COLLABORATE • GROW
          </div>
        </div>
      </div>
    );
  }

  // 2. Icon-only version wrapped in a rounded black card (Favicon / App Icon style)
  return (
    <div style={{
      backgroundColor: '#0F1115',
      borderRadius: '24%', /* matches the rounded corner ratio of standard icons */
      width: `${size}px`,
      height: `${size}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
    }}>
      {renderSvg(true)}
    </div>
  );
}
