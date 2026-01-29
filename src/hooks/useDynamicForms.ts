import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface DynamicForm {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: FormField[];
  submissions: FormSubmission[];
  isActive: boolean;
  createdAt: Date;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: Date;
  userEmail?: string;
  ipAddress?: string;
}

export function useDynamicForms() {
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createForm = useCallback(async (formData: Omit<DynamicForm, 'id' | 'submissions' | 'createdAt'>) => {
    const newForm: DynamicForm = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      submissions: [],
      createdAt: new Date(),
    };

    setForms(prev => [...prev, newForm]);
    
    toast({
      title: "Formulaire créé",
      description: `Le formulaire "${formData.name}" a été créé avec succès`,
    });
    
    return newForm;
  }, [toast]);

  const updateForm = useCallback(async (id: string, updates: Partial<DynamicForm>) => {
    setForms(prev => prev.map(form => 
      form.id === id ? { ...form, ...updates } : form
    ));
    
    toast({
      title: "Formulaire mis à jour",
      description: "Les modifications ont été enregistrées",
    });
  }, [toast]);

  const submitForm = useCallback(async (formId: string, data: Record<string, unknown>) => {
    const submission: FormSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      formId,
      data,
      submittedAt: new Date(),
      userEmail: 'user@example.com',
      ipAddress: '192.168.1.1',
    };

    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, submissions: [...form.submissions, submission] }
        : form
    ));
    
    toast({
      title: "Formulaire soumis",
      description: "Votre réponse a été enregistrée avec succès",
    });
    
    return submission;
  }, [toast]);

  const exportSubmissions = useCallback((formId: string, format: 'csv' | 'json' = 'csv') => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    if (format === 'csv') {
      const headers = form.fields.map(field => field.label);
      const csvContent = [
        headers.join(','),
        ...form.submissions.map(submission => 
          form.fields.map(field => submission.data[field.id] || '').join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.name}-submissions.csv`;
      link.click();
    }

    toast({
      title: "Export réussi",
      description: `Les réponses ont été exportées au format ${format.toUpperCase()}`,
    });
  }, [forms, toast]);

  return {
    forms,
    isLoading,
    createForm,
    updateForm,
    submitForm,
    exportSubmissions,
  };
}
