import { z } from 'zod';

export const passwordSchema = z.string().min(8, 'Minimo de 8 caracteres.');
