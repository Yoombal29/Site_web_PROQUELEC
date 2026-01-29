# MODIFICATIONS À APPLIQUER - Responsive Mobile Design

## 📝 CODE À INTÉGRER DANS LES AUTRES COMPOSANTS

### 1. QuickLinks Component

```tsx
// Remplacer le grid par:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {/* Chaque lien */}
  <Link 
    to={item.url}
    className="card-premium p-6 sm:p-8 text-center hover:shadow-xl transition-all"
  >
    <div className="text-4xl sm:text-5xl mb-4">{item.icon}</div>
    <h3 className="text-lg sm:text-xl font-semibold text-proqblue mb-2">{item.title}</h3>
    <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
  </Link>
</div>
```

### 2. LatestNews Component

```tsx
// Remplacer par:
<section className="py-12 sm:py-16 md:py-20">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-proqblue mb-2 text-center">
      Dernières Actualités
    </h2>
    <div className="w-16 h-1 bg-gradient-to-r from-proqblue to-blue-300 mx-auto mb-12 sm:mb-16"></div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Articles */}
      {articles.map(article => (
        <article key={article.id} className="card-premium overflow-hidden group">
          <img 
            src={article.image}
            alt={article.title}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="p-6 sm:p-8">
            <span className="text-xs sm:text-sm text-proqblue font-semibold">{article.category}</span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">{article.date}</span>
              <Link to={article.url} className="text-proqblue font-semibold hover:opacity-80">
                Lire →
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

### 3. PartnerLogos Component

```tsx
<section className="py-12 sm:py-16 md:py-20 bg-white/50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-proqblue mb-4">
      Nos Partenaires
    </h2>
    <p className="text-center text-gray-600 text-sm sm:text-base mb-8 sm:mb-12">
      Nous collaborons avec les leaders du secteur électrique
    </p>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
      {partners.map(partner => (
        <div 
          key={partner.id}
          className="card-premium h-32 sm:h-40 flex items-center justify-center p-4"
        >
          <img 
            src={partner.logo}
            alt={partner.name}
            className="max-w-[80%] max-h-[60%] object-contain hover:scale-110 transition-transform"
          />
        </div>
      ))}
    </div>
  </div>
</section>
```

### 4. NewsletterSignup Component

```tsx
<section className="py-12 sm:py-16 md:py-20 gradient-premium text-white">
  <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
      Restez Informé
    </h2>
    <p className="text-sm sm:text-base opacity-90 mb-6 sm:mb-8">
      Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et conseils électriques.
    </p>
    
    <form className="flex flex-col sm:flex-row gap-3 sm:gap-2">
      <input 
        type="email"
        placeholder="Votre email"
        className="flex-1 px-4 sm:px-6 py-3 rounded-md text-gray-900 placeholder-gray-500 text-sm sm:text-base"
      />
      <button 
        type="submit"
        className="px-6 sm:px-8 py-3 bg-white text-proqblue font-bold rounded-md hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap"
      >
        S'inscrire
      </button>
    </form>
    
    <p className="text-xs sm:text-sm opacity-75 mt-4">
      Nous respectons votre confidentialité. Désinscription en un clic.
    </p>
  </div>
</section>
```

### 5. Activities Page

```tsx
<main className="max-w-6xl mx-auto py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-proqblue mb-4 text-center">
    Nos activités principales
  </h1>
  <div className="w-16 h-1 bg-gradient-to-r from-proqblue to-blue-300 mx-auto mb-12"></div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
    {paginatedActivities.map((activity, idx) => (
      <div key={idx} className="card-premium p-6 sm:p-8 flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-proqblue to-blue-600 text-white font-bold">
            {idx + 1}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-base sm:text-lg text-gray-900 leading-relaxed">{activity}</p>
        </div>
      </div>
    ))}
  </div>
  
  {totalPages > 1 && (
    <div className="flex justify-center mt-12">
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )}
</main>
```

### 6. Documents Page

```tsx
<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-proqblue mb-2 text-center">
    Documents & Ressources
  </h1>
  <p className="text-center text-gray-600 text-sm sm:text-base mb-12">
    Accédez à nos documents techniques et ressources pédagogiques
  </p>
  
  <div className="space-y-3 sm:space-y-4 divide-y">
    {paginatedDocs.map((doc) => (
      <div key={doc.name} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 sm:py-5 hover:bg-gray-50 px-4 -mx-4 rounded transition-colors">
        <FileText className="flex-shrink-0 text-proqblue h-6 w-6" />
        <span className="flex-1 text-sm sm:text-base font-medium text-gray-900">{doc.name}</span>
        <button className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-proqblue to-blue-600 text-white text-sm sm:text-base font-semibold rounded-md hover:opacity-90 transition-opacity">
          Télécharger
        </button>
      </div>
    ))}
  </div>
</main>
```

### 7. Blog Page

```tsx
<main className="max-w-7xl mx-auto py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-proqblue mb-4 text-center">
    Actualités & Conseils
  </h1>
  <p className="text-lg sm:text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
    Restez informé des dernières nouvelles et des meilleures pratiques du secteur.
  </p>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {paginatedArticles.map(article => (
      <Link 
        to={`/blog/${article.slug}`} 
        key={article.id} 
        className="card-premium group overflow-hidden flex flex-col"
      >
        <img 
          src={article.cover_image_url || '/placeholder.svg'} 
          alt={article.title}
          className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="p-6 sm:p-8 flex flex-col flex-grow">
          {article.blog_categories?.name && (
            <span className="text-xs sm:text-sm text-proqblue font-semibold mb-2">
              {article.blog_categories.name}
            </span>
          )}
          <h2 className="text-lg sm:text-xl font-bold text-proqblue group-hover:text-proqblue-dark transition-colors mb-3 line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
            {article.excerpt}
          </p>
          <div className="flex items-center text-proqblue font-semibold group-hover:underline mt-auto">
            Lire la suite
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </Link>
    ))}
  </div>
  
  {totalPages > 1 && (
    <div className="flex justify-center mt-12">
      <Pagination className="mt-10" />
    </div>
  )}
</main>
```

### 8. Contact Page

```tsx
<main className="max-w-4xl mx-auto py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-proqblue mb-4 text-center">
    Nous Contacter
  </h1>
  <p className="text-center text-gray-600 text-sm sm:text-base mb-12 max-w-2xl mx-auto">
    Une question ? Envoyez-nous un message et nous vous répondrons rapidement.
  </p>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    {/* Formulaire */}
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Nom</label>
        <input 
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-proqblue"
          placeholder="Votre nom"
        />
      </div>
      {/* ... autres champs ... */}
      <button className="w-full py-3 bg-gradient-to-r from-proqblue to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
        Envoyer
      </button>
    </form>
    
    {/* Infos contact */}
    <div className="space-y-8">
      <div className="card-premium p-6 sm:p-8">
        <div className="flex gap-4 mb-4">
          <MapPin className="text-proqblue flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900">Adresse</h3>
            <p className="text-gray-600 text-sm mt-1">123 Rue de l'Électricité, Dakar, Sénégal</p>
          </div>
        </div>
      </div>
      {/* Autres infos ... */}
    </div>
  </div>
</main>
```

---

## 🎯 CSS UTILITIES À AJOUTER

Ajouter au `tailwind.config.ts` :

```typescript
extend: {
  animation: {
    'fade-in-up': 'fadeInUp 0.6s ease-out',
    'fade-in-down': 'fadeInDown 0.6s ease-out',
    'slide-in-right': 'slideInRight 0.6s ease-out',
  },
  keyframes: {
    fadeInUp: {
      '0%': { opacity: '0', transform: 'translateY(20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    fadeInDown: {
      '0%': { opacity: '0', transform: 'translateY(-20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    slideInRight: {
      '0%': { opacity: '0', transform: 'translateX(20px)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
  },
}
```

---

## ✅ CHECKLIST D'APPLICATION

- [ ] QuickLinks : Responsive grid + card-premium
- [ ] LatestNews : Card layout with images
- [ ] PartnerLogos : Grid responsive
- [ ] NewsletterSignup : Form responsive
- [ ] Activities : Card numbered list
- [ ] Documents : Flex layout responsive
- [ ] Blog : Card grid with images
- [ ] Contact : Two-column layout responsive
- [ ] All pages : Consistent spacing (py-12 sm:py-16 md:py-20)
- [ ] All pages : Responsive padding (px-4 sm:px-6 lg:px-8)
- [ ] Images : Lazy loading + responsive
- [ ] Forms : Full-width on mobile, auto on desktop
- [ ] Tables : Horizontal scroll on mobile

---

## 🧪 TESTING

Vérifier pour chaque page:
- ✅ Mobile (375px) - Full width, single column
- ✅ Tablet (768px) - 2 columns where appropriate
- ✅ Desktop (1440px) - Full layout with 3-4 columns
- ✅ Touch targets minimum 44px
- ✅ Text readable without zooming
- ✅ Images responsive
- ✅ Forms usable on mobile

---

**Note** : Ces modifications peuvent être appliquées progressivement. Commencez par les pages les plus visitées (Index, Blog, Documents).
