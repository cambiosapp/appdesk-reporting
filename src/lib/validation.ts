import { z } from 'zod';

export const reportTypes = ['bug', 'task', 'feature'] as const;
export const reportPriorities = ['low', 'medium', 'high', 'critical'] as const;
export const reportStatuses = ['open', 'in_progress', 'resolved', 'closed', 'reopened'] as const;

export const createReportSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200, 'Máximo 200 caracteres'),
  type: z.enum(reportTypes, { message: 'Tipo inválido' }),
  priority: z.enum(reportPriorities, { message: 'Prioridad inválida' }),
  description: z.string().min(1, 'La descripción es obligatoria').max(5000, 'Máximo 5000 caracteres'),
  moduleId: z.string().uuid().nullable().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
  })).optional().default([]),
});

export const updateReportSchema = z.object({
  id: z.string().uuid('ID inválido'),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(reportTypes).optional(),
  priority: z.enum(reportPriorities).optional(),
  description: z.string().min(1).max(5000).optional(),
  status: z.enum(reportStatuses).optional(),
  moduleId: z.string().uuid().nullable().optional(),
});

export const createModuleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500).nullable().optional(),
});

export const updateModuleSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
  role: z.enum(['admin', 'reporter']).default('reporter'),
});

export const jiraCreateSchema = z.object({
  reportId: z.string().uuid('reportId inválido'),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
