const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "import { motion } from 'motion/react';",
  "import { motion, AnimatePresence } from 'motion/react';"
);

code = code.replace(
  "Activity, Users, IndianRupee",
  "Menu, X, Plus, Activity, Users, IndianRupee"
);

code = code.replace(
  "const [activeTab, setActiveTab] = useState('overview');",
  "const [activeTab, setActiveTab] = useState('overview');\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
