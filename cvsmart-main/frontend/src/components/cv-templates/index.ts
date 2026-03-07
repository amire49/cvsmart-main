import React from "react";

export { TemplateClassic } from "./template-classic";
export { TemplateModern } from "./template-modern";
export { TemplateMinimal } from "./template-minimal";
export { TemplateSelector } from "./template-selector";
export type { TemplateId } from "./template-selector";
export type { CVData, ExperienceItem, EducationItem, ProjectItem } from "./types";

import type { CVData } from "./types";
import type { TemplateId } from "./template-selector";
import { TemplateClassic } from "./template-classic";
import { TemplateModern } from "./template-modern";
import { TemplateMinimal } from "./template-minimal";

export const TEMPLATE_MAP: Record<
  TemplateId,
  React.ComponentType<{ data: CVData }>
> = {
  classic: TemplateClassic,
  modern: TemplateModern,
  minimal: TemplateMinimal,
};
