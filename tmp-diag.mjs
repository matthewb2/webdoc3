import fs from 'node:fs';

const read = (p) => {
  console.log('===== ' + p + ' =====');
  const c = fs.readFileSync(p, 'utf8');
  const lines = c.split(/\r?\n/);
  lines.forEach((l, i) => console.log(String(i + 1).padStart(4) + ': ' + l));
};

read('D:/webdoc3/src/hwp/hwpParser.ts');
read('D:/webdoc3/src/hwp/hwp.d.ts');
read('D:/webdoc3/src/types.ts');
read('D:/webdoc3/src/main.ts');