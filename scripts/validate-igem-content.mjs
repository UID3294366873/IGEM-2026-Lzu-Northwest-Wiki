import { readFile } from 'node:fs/promises';

const files = [
  'src/pages/TeamPage.tsx',
  'src/components/layout/PageLayout.tsx',
  'src/data/team.ts',
];
const draftMarkers = [
  '内容核验中',
  '等待真实',
  '证据插槽',
  '预留区域',
  '结构示例',
  '正式上线前',
  '正式发布时',
];
const findings = [];

for (const file of files) {
  const contents = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  contents.split(/\r?\n/).forEach((line, index) => {
    draftMarkers.forEach((marker) => {
      if (line.includes(marker)) findings.push(`${file}:${index + 1} (${marker})`);
    });
  });
}

if (findings.length) {
  console.error('Verified team content is still required before official deployment:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log('No known draft-content markers remain.');
}
