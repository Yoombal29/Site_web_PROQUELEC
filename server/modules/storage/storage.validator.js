const z = require('zod');

const renameFileSchema = z.object({
    newName: z.string().min(1, 'Nouveau nom requis').trim(),
});

const createMediaFileSchema = z.object({
    file_name: z.string().min(1, 'Nom requis'),
    file_path: z.string().min(1, 'Chemin requis'),
    file_type: z.string().optional(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
    alt_text: z.string().optional(),
    project_id: z.string().uuid().nullable().optional(),
    folder_path: z.string().optional(),
    status: z.string().optional(),
    metadata: z.any().optional(),
});

module.exports = { renameFileSchema, createMediaFileSchema };
