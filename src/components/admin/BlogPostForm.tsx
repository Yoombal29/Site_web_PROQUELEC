import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BlogPost, useCreateBlogPost, useUpdateBlogPost } from '@/hooks/useBlogPosts';
import { BlogPostEditor } from './BlogPostEditor';
import ImageUploadInput from './ImageUploadInput';
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetBlogCategories } from '@/hooks/useBlogCategories';

const formSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit faire au moins 3 caractères." }),
  slug: z.string().min(3, { message: "Le slug doit faire au moins 3 caractères." }).regex(/^[a-z0-9-]+$/, { message: "Le slug ne peut contenir que des minuscules, chiffres et tirets."}),
  excerpt: z.string().max(300, { message: "L'extrait ne doit pas dépasser 300 caractères." }).optional().nullable(),
  cover_image_url: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().nullable(),
  content: z.string().min(10, { message: "Le contenu est trop court." }),
  published_at: z.date().optional().nullable(),
  category_id: z.number().optional().nullable(),
});

type BlogPostFormValues = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  post?: BlogPost;
  onSuccess: () => void;
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
};

export default function BlogPostForm({ post, onSuccess }: BlogPostFormProps) {
  const createPostMutation = useCreateBlogPost();
  const updatePostMutation = useUpdateBlogPost();
  const { data: categories, isLoading: isLoadingCategories } = useGetBlogCategories();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      cover_image_url: post?.cover_image_url || '',
      content: post?.content || '',
      published_at: post?.published_at ? new Date(post.published_at) : undefined,
      category_id: post?.category_id || undefined,
    }
  });

  const titleValue = form.watch("title");

  useEffect(() => {
    if (titleValue && !form.getValues('slug') && !post) {
      form.setValue('slug', slugify(titleValue));
    }
  }, [titleValue, form, post]);


  const onSubmit = (values: BlogPostFormValues) => {
    const dataToSubmit = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt ?? null,
      cover_image_url: values.cover_image_url ?? null,
      content: values.content,
      published_at: values.published_at ? values.published_at.toISOString() : null,
      category_id: values.category_id ?? null,
    };

    if (post) {
      updatePostMutation.mutate({ id: post.id, ...dataToSubmit }, {
        onSuccess: () => onSuccess()
      });
    } else {
      createPostMutation.mutate(dataToSubmit, {
        onSuccess: () => onSuccess()
      });
    }
  };

  const isPending = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Le titre de votre article" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input placeholder="titre-de-votre-article" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extrait (résumé)</FormLabel>
              <FormControl>
                <Textarea placeholder="Un court résumé de l'article pour la page de blog..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image de couverture</FormLabel>
              <FormControl>
                <ImageUploadInput 
                  value={field.value} 
                  onChange={field.onChange} 
                  bucketName="blog-covers"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu de l'article</FormLabel>
              <FormControl>
                <BlogPostEditor {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'null' ? null : Number(value))}
                defaultValue={field.value ? field.value.toString() : "null"}
              >
                <FormControl>
                  <SelectTrigger disabled={isLoadingCategories}>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Aucune catégorie</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="published_at"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Publication</FormLabel>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? new Date() : null);
                        }}
                      />
                      <span className="text-sm">
                        {field.value ? `Publié le ${format(field.value, 'PPP', { locale: fr })}` : "Brouillon"}
                      </span>
                      {field.value && (
                        <Popover>
                          <PopoverTrigger asChild>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                      "w-[240px] justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                  )}
                              >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="single"
                                  selected={field.value ?? undefined}
                                  onSelect={(date) => field.onChange(date)}
                                  initialFocus
                              />
                          </PopoverContent>
                      </Popover>
                      )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement...' : (post ? 'Mettre à jour' : 'Créer l\'article')}
        </Button>
      </form>
    </Form>
  );
}
