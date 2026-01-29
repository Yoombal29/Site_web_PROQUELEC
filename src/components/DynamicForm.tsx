import React, { useState } from 'react';
import { useDynamicForms } from '@/hooks/useDynamicSystems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DynamicFormProps {
  formName: string;
  onSubmit?: (data: Record<string, any>) => void;
  className?: string;
}

export function DynamicForm({ formName, onSubmit, className }: DynamicFormProps) {
  const { data: forms, isLoading } = useDynamicForms();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = forms?.find(f => f.name === formName);

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>;
  }

  if (!form) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <p className="text-red-800">Formulaire "{formName}" introuvable</p>
      </div>
    );
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation basique
      const requiredFields = form.fields.filter((field: any) => field.required);
      const missingFields = requiredFields.filter((field: any) => !formData[field.name]);

      if (missingFields.length > 0) {
        toast({
          title: 'Champs requis manquants',
          description: `Veuillez remplir: ${missingFields.map((f: any) => f.label).join(', ')}`,
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Soumission selon l'action définie
      switch (form.submit_action) {
        case 'database':
          await submitToDatabase(form, formData);
          break;
        case 'email':
          await submitToEmail(form, formData);
          break;
        case 'webhook':
          await submitToWebhook(form, formData);
          break;
        case 'api':
          await submitToApi(form, formData);
          break;
        default:
          console.log('Données du formulaire:', formData);
      }

      toast({
        title: 'Formulaire envoyé',
        description: 'Votre message a été envoyé avec succès.',
      });

      // Reset form
      setFormData({});

      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        {form.description && <CardDescription>{form.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {form.fields.map((field: any) => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name] || ''}
              onChange={(value) => handleInputChange(field.name, value)}
            />
          ))}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Envoi en cours...' : (form.settings?.submitText || 'Envoyer')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface FormFieldProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
}

function FormField({ field, value, onChange }: FormFieldProps) {
  const { type, name, label, placeholder, required, options } = field;

  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
      return (
        <div>
          <Label htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <Label htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <Label htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            checked={value}
            onCheckedChange={onChange}
          />
          <Label htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        </div>
      );

    case 'radio':
      return (
        <div>
          <Label>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <RadioGroup value={value} onValueChange={onChange}>
            {options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    default:
      return (
        <div className="p-2 border border-yellow-300 bg-yellow-50 rounded">
          <p className="text-yellow-800">Type de champ non supporté: {type}</p>
        </div>
      );
  }
}

// Fonctions de soumission
async function submitToDatabase(form: any, data: Record<string, any>) {
  const { error } = await supabase
    .from('form_submissions')
    .insert({
      form_name: form.name,
      data: data,
      submitted_at: new Date().toISOString()
    });

  if (error) throw error;
}

async function submitToEmail(form: any, data: Record<string, any>) {
  // Intégration avec le service email existant
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      to: form.settings.emailRecipient,
      subject: form.settings.emailSubject || `Nouveau formulaire: ${form.title}`,
      template: 'form-submission',
      data: { form, submission: data }
    }
  });

  if (error) throw error;
}

async function submitToWebhook(form: any, data: Record<string, any>) {
  const response = await fetch(form.settings.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form: form.name, data, timestamp: new Date().toISOString() })
  });

  if (!response.ok) throw new Error('Erreur webhook');
}

async function submitToApi(form: any, data: Record<string, any>) {
  const response = await fetch(form.settings.apiUrl, {
    method: form.settings.apiMethod || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...form.settings.apiHeaders
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Erreur API');
}