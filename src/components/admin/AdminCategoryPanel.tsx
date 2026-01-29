
import { useState, useMemo } from 'react';
import { useGetBlogCategories, useCreateBlogCategory, useUpdateBlogCategory, useDeleteBlogCategory, BlogCategory } from "@/hooks/useBlogCategories";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, { message: "Le nom doit faire au moins 2 caractères." }),
});
type CategoryFormValues = z.infer<typeof categorySchema>;

function CategoryForm({ category, onSuccess }: { category?: BlogCategory; onSuccess: () => void; }) {
  const createMutation = useCreateBlogCategory();
  const updateMutation = useUpdateBlogCategory();
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name || '' },
  });

  const onSubmit = (data: CategoryFormValues) => {
    if (category) {
      updateMutation.mutate({ id: category.id, name: data.name }, { onSuccess });
    } else {
      createMutation.mutate({ name: data.name }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de la catégorie</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
        <Button type="submit" disabled={isPending}>{isPending ? 'Enregistrement...' : 'Enregistrer'}</Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminCategoryPanel() {
  const { data: categories, isLoading, error } = useGetBlogCategories();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);
  const totalPages = useMemo(() => Math.ceil(filteredCategories.length / pageSize), [filteredCategories]);
  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, page]);
  const deleteMutation = useDeleteBlogCategory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | undefined>(undefined);

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(undefined);
  };

  if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-proqblue" /></div>;
  if (error) return <div className="text-red-600">Erreur: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-proqblue-dark">Gestion des catégories</h3>
        <Button onClick={handleCreate} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Créer une catégorie</Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          </DialogHeader>
          <CategoryForm category={editingCategory} onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>
      
      <input
        type="text"
        placeholder="Rechercher une catégorie..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 px-3 py-2 border rounded w-full max-w-xs text-sm"
      />
      <div className="space-y-2">
        {paginatedCategories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
            <span>{cat.name}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}><Edit className="h-4 w-4" /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-8 w-8" disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>La suppression est définitive. Assurez-vous qu'aucun article n'utilise cette catégorie.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(cat.id)}>Confirmer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
