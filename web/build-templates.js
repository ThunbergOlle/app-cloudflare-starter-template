const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templateDir = './src/templates';
const outputDir = './src/generated';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(templateDir)) {
  console.log('No templates directory found, skipping template compilation');
  process.exit(0);
}

fs.readdirSync(templateDir).forEach((file) => {
  if (file.endsWith('.hbs')) {
    const template = fs.readFileSync(path.join(templateDir, file), 'utf8');
    const compiled = Handlebars.precompile(template);
    const output = `export default ${compiled};`;

    fs.writeFileSync(path.join(outputDir, `${path.basename(file, '.hbs')}.ts`), output);
    console.log(`Compiled ${file} -> ${path.basename(file, '.hbs')}.ts`);
  }
});