const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

code = code.replace(
  /function useImageWidth.*?return width;\n}/s,
  `function useImageDimensions(src: string, sectionWidth: number, sectionHeight: number) {
  const [dims, setDims] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!sectionWidth || !sectionHeight) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const scale = Math.max(sectionWidth / img.naturalWidth, sectionHeight / img.naturalHeight);
      setDims({ width: img.naturalWidth * scale, height: img.naturalHeight * scale });
    };
  }, [src, sectionWidth, sectionHeight]);
  return dims;
}`
);

code = code.replace(
  /function MaskedCard\({.*?}\) {.*?return \(/s,
  `function MaskedCard({ 
  bgImage, position, imageDims, focalX, className, children, cardRef, style 
}: { 
  bgImage: string, position: any, imageDims: { width: number, height: number }, focalX: number, className: string, children: React.ReactNode, cardRef: (el: HTMLDivElement | null) => void, style?: React.CSSProperties
}) {
  const overflowX = imageDims.width > (position?.sw || 0) ? imageDims.width - (position?.sw || 0) : 0;
  const overflowY = imageDims.height > (position?.sh || 0) ? imageDims.height - (position?.sh || 0) : 0;
  const focalOffsetX = overflowX * focalX;
  const focalOffsetY = overflowY * 0.5;

  const bgStyle: React.CSSProperties = position?.sh ? {
    backgroundImage: \`url(\${bgImage})\`,
    backgroundSize: \`\${imageDims.width}px \${imageDims.height}px\`,
    backgroundPosition: \`-\${position.x + focalOffsetX}px -\${position.y + focalOffsetY}px\`,
    backgroundRepeat: 'no-repeat'
  } : {};

  return (`
);

code = code.replace(
  /const s1ImgWidth = useImageWidth\(HERO_IMAGE, s1Positions\[0\]\?.sh \|\| 0\);/g,
  `const s1ImgDims = useImageDimensions(HERO_IMAGE, s1Positions[0]?.sw || 0, s1Positions[0]?.sh || 0);`
);

code = code.replace(
  /const s2ImgWidth = useImageWidth\(SECTION2_IMAGE, s2Positions\[0\]\?.sh \|\| 0\);/g,
  `const s2ImgDims = useImageDimensions(SECTION2_IMAGE, s2Positions[0]?.sw || 0, s2Positions[0]?.sh || 0);`
);

code = code.replace(/imageWidth=\{s1ImgWidth\}/g, `imageDims={s1ImgDims}`);
code = code.replace(/imageWidth=\{s2ImgWidth\}/g, `imageDims={s2ImgDims}`);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
