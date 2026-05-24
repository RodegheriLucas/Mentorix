const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src/pages');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  if (file.includes('LoginPage') || file.includes('MeusCards') || file.includes('FeedMentoria')) return;

  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Pattern 1: AlunoDashboard, MentorDashboard, etc. with "Olá, {user?.nome"
  if (content.match(/<h1[^>]*>Olá, \{?user\?\.nome\?\.split\(' '\)\[0\]\}?!<\/h1>/)) {
    // Need to insert PageHeader
    if (!content.includes('PageHeader')) {
      content = content.replace(/(import React[^;]*;)/, `$1\nimport { PageHeader } from '../../components/ui/PageHeader';`);
    }
    content = content.replace(/<h1[^>]*>Olá, \{?user\?\.nome\?\.split\(' '\)\[0\]\}?!<\/h1>/, `<PageHeader title={\`Olá, \${user?.nome?.split(' ')[0]}!\`} showAvatar />`);
    changed = true;
  }
  
  // Pattern 2: HistoricoMentorias
  if (file.includes('HistoricoMentorias.tsx')) {
    if (!content.includes('PageHeader')) {
      content = content.replace(/(import React[^;]*;)/, `$1\nimport { PageHeader } from '../../components/ui/PageHeader';`);
    }
    content = content.replace(/<div style=\{\{ padding: '12px 0 14px' \}\}>[\s\S]*?<\/div>\s*<\/div>\s*<h1[^>]*>Histórico<\/h1>/, `<PageHeader title="Histórico" />`);
    changed = true;
  }

  // Pattern 3: AgendamentosPage
  if (file.includes('AgendamentosPage.tsx')) {
    if (!content.includes('PageHeader')) {
      content = content.replace(/(import React[^;]*;)/, `$1\nimport { PageHeader } from '../components/ui/PageHeader';`);
    }
    content = content.replace(/<div style=\{\{ padding: '12px 0 14px' \}\}>[\s\S]*?<\/div>\s*<\/div>\s*<h1[^>]*>\{pageTitle\}<\/h1>/, `<PageHeader title={pageTitle} />`);
    changed = true;
  }
  
  // Pattern 4: ContaPage
  if (file.includes('ContaPage.tsx')) {
    if (!content.includes('PageHeader')) {
      content = content.replace(/(import React[^;]*;)/, `$1\nimport { PageHeader } from '../components/ui/PageHeader';`);
    }
    content = content.replace(/<div style=\{\{ padding: '12px 0 14px' \}\}>[\s\S]*?<\/div>\s*<\/div>\s*<h1[^>]*>Minha conta<\/h1>/, `<PageHeader title="Minha conta" />`);
    changed = true;
  }

  // Pattern 5: Gestor GerenciarAmbientes
  if (file.includes('GerenciarAmbientes.tsx')) {
     if (!content.includes('PageHeader')) {
      content = content.replace(/(import React[^;]*;)/, `$1\nimport { PageHeader } from '../../components/ui/PageHeader';`);
    }
    content = content.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 \}\}>\s*<h1[^>]*>Ambientes<\/h1>/, `<PageHeader title="Ambientes" />\n      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated', file);
  }
});
