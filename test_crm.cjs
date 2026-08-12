const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const tableStart = '<Card className="overflow-hidden p-0">';
const tableEnd = '</table>\n                </div>\n              </Card>';
const crmRegex = new RegExp(tableStart + '[\\s\\S]*?' + tableEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

console.log(crmRegex.test(code) ? "Found table match" : "Table match failed");
