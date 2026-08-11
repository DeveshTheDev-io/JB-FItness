const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "import {  Activity, Calendar, Clock, CreditCard, Play, Plus, History, Users, Dumbbell, Wind, AlertCircle, ArrowLeft, ClipboardList, Bell, LineChart as LineChartIcon, TrendingUp, Award , Lock } from 'lucide-react';",
  "import {  Activity, Calendar, Clock, CreditCard, Play, Plus, History, Users, Dumbbell, Wind, AlertCircle, ArrowLeft, ClipboardList, Bell, LineChart as LineChartIcon, TrendingUp, Award , Lock, User, Camera } from 'lucide-react';"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
