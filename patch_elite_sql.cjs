const fs = require('fs');

function replaceInFile(file, oldStr, newStr) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.split(oldStr).join(newStr);
    fs.writeFileSync(file, code);
  }
}

replaceInFile('database_schema.sql', 'Elite Fitness', 'Fitness');
replaceInFile('database_schema.sql', 'elite fitness', 'fitness');
replaceInFile('schema.sql', 'Elite Fitness', 'Fitness');
replaceInFile('schema.sql', 'elite fitness', 'fitness');
replaceInFile('updated_schema.sql', 'Elite Fitness', 'Fitness');
replaceInFile('full_schema.sql', 'Elite Fitness', 'Fitness');

