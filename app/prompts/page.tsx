import Prompts from '@/components/Dashboard/Prompts';
import prisma from '@/prisma/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getPrompts() {
  const prompts = await prisma.prompt.findMany();
  const data: { [key: string]: string } = {};
  prompts.forEach((prompt) => {
    data[prompt.key] = prompt.value;
  });

  const filePath = path.join(process.cwd(), 'prompts.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const defaultPromptsObject = JSON.parse(fileContents);
  const defaultPrompts = Object.keys(defaultPromptsObject).map((key) => {
    return { key, value: defaultPromptsObject[key] };
  });

  defaultPrompts.forEach((prompt: { key: string; value: string }) => {
    if (!data[prompt.key]) {
      data[prompt.key] = prompt.value;
    }
  });

  return data;
}

export default async function Page() {
  const prompts = await getPrompts();
  return <Prompts prompts={prompts} />;
}
