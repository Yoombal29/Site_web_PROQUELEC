import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Project {
    id: string;
    title: string;
    reference: string;
    client_info: { name?: string; contact?: string; email?: string };
    location: { city?: string; address?: string };
    status: 'etude' | 'chantier' | 'controle' | 'livre';
    compliance_score: number;
    technical_info?: {
        installation_type?: string;
        power_subscribed?: string;
        voltage_type?: string;
    };
    regulatory_status?: 'draft' | 'submitted' | 'under_review' | 'validated' | 'rejected' | 'archived';
    compliance_details?: {
        overall_score: number;
        breakdown: { domain: string; score: number; weight: number }[];
        last_evaluated_at: string;
        ai_model_version: string;
    };
    created_at: string;
    updated_at: string;
}

export interface ProjectDocument {
    id: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    uploaded_at: string;
    project_id: string;
    doc_category?: string;
    compliance_status?: 'pending' | 'compliant' | 'warning' | 'danger';
}

export interface AuditLog {
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    changes: any;
    performed_by: string;
    performed_by_email?: string;
    performed_by_role?: string;
    performed_at: string;
    signature_hash: string;
}

const fetchProjects = async (): Promise<Project[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
};

const fetchProject = async (id: string): Promise<Project> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
};

const fetchProjectAudit = async (id: string): Promise<AuditLog[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/projects/${id}/audit`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch audit trail');
    return res.json();
};

const fetchProjectDocuments = async (id: string): Promise<ProjectDocument[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/projects/${id}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
};

const createProject = async (project: Partial<Project>) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
};

const updateProject = async ({ id, data }: { id: string; data: Partial<Project> }) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
};

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProject,
        onSuccess: (updatedProject) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
            toast.success('Projet mis à jour avec succès');
        },
        onError: (err) => {
            toast.error('Erreur lors de la mise à jour: ' + err.message);
        }
    });
}

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects
    });
}

// INSPECTION TYPES
export interface Inspection {
    id: string;
    checklist_title: string;
    inspector_name: string;
    status: 'draft' | 'submitted' | 'validated';
    overall_score: number;
    created_at: string;
}

const fetchProjectInspections = async (id: string): Promise<Inspection[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/projects/${id}/inspections`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch inspections');
    return res.json();
};

export function useProject(id: string) {
    const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery({
        queryKey: ['project', id],
        queryFn: () => fetchProject(id),
        enabled: !!id
    });

    const { data: documents, isLoading: isLoadingDocs } = useQuery({
        queryKey: ['project-docs', id],
        queryFn: () => fetchProjectDocuments(id),
        enabled: !!id
    });

    const { data: inspections, isLoading: isLoadingInsp } = useQuery({
        queryKey: ['project-inspections', id],
        queryFn: () => fetchProjectInspections(id),
        enabled: !!id
    });

    const { data: auditLogs, isLoading: isLoadingAudit } = useQuery({
        queryKey: ['project-audit', id],
        queryFn: () => fetchProjectAudit(id),
        enabled: !!id
    });

    return {
        project,
        documents,
        inspections,
        auditLogs,
        isLoading: isLoadingProject || isLoadingDocs || isLoadingInsp || isLoadingAudit,
        error: projectError
    };
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Projet créé avec succès');
        },
        onError: (err) => {
            toast.error('Erreur à la création: ' + err.message);
        }
    });
}
export function useDeleteInspection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/inspections/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-inspections'] });
            toast.success('Diagnostic supprimé');
        },
        onError: (err) => toast.error('Erreur: ' + err.message)
    });
}

export function useDeleteAuditLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/audit-logs/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-audit'] });
            toast.success('Entrée journal supprimée');
        },
        onError: (err) => toast.error('Erreur: ' + err.message)
    });
}
