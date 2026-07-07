const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const relativeUiRegex = /from ['"]\.\.\/ui\/([a-zA-Z0-9_-]+)['"]/g;
      if (relativeUiRegex.test(content)) {
        content = content.replace(/from ['"]\.\.\/ui\/([a-zA-Z0-9_-]+)['"]/g, "from '@corely/ui'");
        changed = true;
      }

      const regex = /@corely\/ui\/components\/ui\/[a-zA-Z0-9_-]+/g;
      if (regex.test(content)) {
        content = content.replace(regex, '@corely/ui');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + fullPath);
      }
    }
  }
}

replaceInDir('apps/app/src');
replaceInDir('apps/web/src');
