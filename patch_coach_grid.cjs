const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// Change coach grid height
code = code.replace(
  /className="rounded-xl md:rounded-2xl overflow-hidden relative group cursor-pointer h-\[450px\] md:h-\[550px\] xl:h-\[650px\] w-full"/g,
  'className="rounded-xl md:rounded-2xl overflow-hidden relative group cursor-pointer aspect-[3/4] md:aspect-auto md:h-[550px] xl:h-[650px] w-full"'
);

// Change modal image height
code = code.replace(
  /className="w-full md:w-1\/2 h-\[250px\] sm:h-\[300px\] md:h-auto shrink-0 relative"/g,
  'className="w-full md:w-1/2 h-[400px] sm:h-[500px] md:h-auto shrink-0 relative bg-neutral-900"'
);

code = code.replace(
  /className="w-full h-full object-cover object-top"/g,
  'className="w-full h-full object-contain"'
);

// Actually, in the grid we might want object-cover still, but with the taller aspect ratio it will show more.
// If the user wants 70% image, let's change object-top to object-cover object-[center_15%] in the grid just in case.
// Wait, the replace above would change the modal img to object-contain, which is good. But let's restore object-cover for the grid if we replaced it?
// The grid image has: className="absolute inset-0 w-full h-full object-cover object-top grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
// So the object-contain replace won't hit it because it doesn't match exactly.

code = code.replace(
  /className="absolute inset-0 w-full h-full object-cover object-top grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"/g,
  'className="absolute inset-0 w-full h-full object-cover object-[center_10%] grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"'
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
