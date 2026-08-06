const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const oldUseImageDimensions = /function useImageDimensions[\s\S]*?return dims;\n\}/;

const newUseImageDimensions = `function useImageDimensions(src: string, sectionWidth: number, sectionHeight: number) {
  const [naturalDims, setNaturalDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setNaturalDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [src]);

  if (!sectionWidth || !sectionHeight || !naturalDims.width || !naturalDims.height) {
    return { width: 0, height: 0 };
  }

  const scale = Math.max(sectionWidth / naturalDims.width, sectionHeight / naturalDims.height);
  return { width: naturalDims.width * scale, height: naturalDims.height * scale };
}`;

code = code.replace(oldUseImageDimensions, newUseImageDimensions);
fs.writeFileSync('src/pages/LandingPage.tsx', code);
