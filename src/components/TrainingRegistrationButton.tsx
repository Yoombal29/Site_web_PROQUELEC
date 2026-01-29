
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRegisterForTraining } from '@/hooks/useProfessionalTraining';
import { useSession } from '@/hooks/useSession';
import { toast } from 'sonner';

interface TrainingRegistrationButtonProps {
  trainingId: string;
  trainingTitle: string;
  disabled?: boolean;
}

export const TrainingRegistrationButton: React.FC<TrainingRegistrationButtonProps> = ({
  trainingId,
  trainingTitle,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    participant_name: '',
    participant_email: '',
    participant_phone: '',
    company_name: '',
    special_requirements: ''
  });

  const { user } = useSession();
  const registerMutation = useRegisterForTraining();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour vous inscrire');
      return;
    }

    if (!formData.participant_name || !formData.participant_email) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        training_id: trainingId,
        user_id: user.id,
        participant_name: formData.participant_name,
        participant_email: formData.participant_email,
        participant_phone: formData.participant_phone,
        company_name: formData.company_name,
        special_requirements: formData.special_requirements,
        status: 'pending',
        payment_status: 'pending'
      });

      setIsOpen(false);
      setFormData({
        participant_name: '',
        participant_email: '',
        participant_phone: '',
        company_name: '',
        special_requirements: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.error('Vous devez être connecté pour vous inscrire')}
      >
        Inscription
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="px-4 py-2 rounded bg-gradient-to-r from-proqblue via-proqblue-dark to-proqgray-dark text-white hover:scale-105 transition-all duration-150 text-sm font-roboto shadow-xl border hover:from-proqblue-dark hover:to-proqblue"
          disabled={disabled || registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Inscription...' : 'Inscription'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inscription - {trainingTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participant_name">Nom complet *</Label>
            <Input
              id="participant_name"
              value={formData.participant_name}
              onChange={(e) => handleInputChange('participant_name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="participant_email">Email *</Label>
            <Input
              id="participant_email"
              type="email"
              value={formData.participant_email}
              onChange={(e) => handleInputChange('participant_email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="participant_phone">Téléphone</Label>
            <Input
              id="participant_phone"
              value={formData.participant_phone}
              onChange={(e) => handleInputChange('participant_phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_name">Entreprise</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="special_requirements">Exigences particulières</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => handleInputChange('special_requirements', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="bg-proqblue hover:bg-proqblue-dark"
            >
              {registerMutation.isPending ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
