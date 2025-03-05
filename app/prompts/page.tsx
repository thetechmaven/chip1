import Prompts from '@/components/Dashboard/Prompts';
import fs from 'fs';
import path from 'path';

function getPrompts() {
  const filePath = path.join(process.cwd(), 'prompts.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const prompts = JSON.parse(fileContents);
  return prompts;
}

export default function Page() {
  const prompts = getPrompts();
  return <Prompts prompts={prompts} />;
}
