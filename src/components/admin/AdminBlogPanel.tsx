
import { useState, useMemo } from 'react';
import { useGetBlogPosts, useDeleteBlogPost, BlogPost } from "@/hooks/useBlogPosts";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from
"@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from

"@/components/ui/dialog";
import BlogPostForm from './BlogPostForm';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink } from
"@/components/ui/pagination";


export default function AdminBlogPanel() {
  const { data: posts, isLoading, error } = useGetBlogPosts();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.slug && post.slug.toLowerCase().includes(search.toLowerCase())
    );
  }, [posts, search]);
  const totalPages = useMemo(() => Math.ceil(filteredPosts.length / pageSize), [filteredPosts]);
  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, page]);
  const deletePostMutation = useDeleteBlogPost();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);

  const handleDelete = (id: string) => {
    deletePostMutation.mutate(id);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(undefined);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPost(undefined);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-100 rounded-md">Erreur: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-primary">Gestion des articles</h3>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="text"
            placeholder="Rechercher par titre ou slug..."
            value={search}
            onChange={(e) => {setSearch(e.target.value);setPage(1);}}
            className="px-3 py-2 border border-border bg-background text-foreground rounded w-full max-w-xs text-sm" />
          
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2" />
            Créer un article
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Modifier l'article" : "Créer un nouvel article"}</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous. Les modifications seront visibles publiquement une fois l'article publié.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <BlogPostForm post={editingPost} onSuccess={handleDialogClose} />
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {paginatedPosts && paginatedPosts.length > 0 ?
        paginatedPosts.map((post) =>
        <div key={post.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card shadow-sm">
              <div>
                <h4 className="font-bold">{post.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{post.slug ? `/blog/${post.slug}` : 'Pas de slug'}</span>
                  {post.blog_categories?.name && <span className="bg-secondary px-2 py-0.5 rounded-full text-xs text-secondary-foreground">{post.blog_categories.name}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {post.published_at ? `Publié le ${new Date(post.published_at).toLocaleDateString('fr-FR')}` : 'Brouillon'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deletePostMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible et supprimera définitivement cet article de blog.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(post.id)}>
                        Confirmer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
        ) :

        <p className="text-center text-muted-foreground py-6">Aucun article pour le moment.</p>
        }
        {totalPages > 1 &&
        <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) =>
              <PaginationItem key={i}>
                    <PaginationLink
                  isActive={page === i + 1}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}>
                  
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
              )}
              </PaginationContent>
            </Pagination>
          </div>
        }
      </div>
    </div>);

}