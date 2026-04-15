import { NextResponse } from 'next/server';
import { defaultConfig } from '@/lib/defaults';
import { templates } from '@/lib/templates/index';

export async function GET() {
  return NextResponse.json({
    defaultConfig,
    availableTemplates: templates.map(t => ({
      id: t.id,
      name: t.name,
      defaultBackground: t.defaultBackground,
      defaultTextColor: t.defaultTextColor
    })),
    defaultTemplate: templates.find(t => t.id === defaultConfig.templateId)
  });
}