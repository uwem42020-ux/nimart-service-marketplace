import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';                         // ← fixed
import { SEO } from '../components/common/SEO';                    // ← fixed
import { NimartSpinner } from '../components/common/NimartSpinner'; // ← fixed
import { Breadcrumbs } from '../components/common/Breadcrumbs';    // ← fixed
import { Calendar, User, Tag, ArrowLeft, Share2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug');
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.category, post?.id],
    queryFn: async () => {
      if (!post?.category || !post?.id) return [];
      const { data } = await supabase
        .from('blog_posts')
        .select('id, slug, title, featured_image, created_at')
        .eq('published', true)
        .eq('category', post.category)
        .neq('id', post.id)
        .order('created_at', { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!post?.category && !!post?.id,
  });

  const shareUrl = `https://nimart.ng/blog/${slug}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: shareUrl }).catch(() => copyLink());
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied!'));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><NimartSpinner size="lg" /></div>;
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
        <button onClick={() => navigate('/blog')} className="text-primary-600 hover:underline">Back to blog</button>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || post.title,
    "image": post.featured_image || "https://nimart.ng/og-image.png",
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author || "Nimart Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Nimart",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nimart.ng/logo.png"
      }
    },
    "url": shareUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nimart.ng" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://nimart.ng/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title }
    ]
  };

  return (
    <>
      <SEO
        title={`${post.title} | Nimart Blog`}
        description={post.excerpt || `Read ${post.title} on the Nimart blog – tips for hiring trusted services in Nigeria.`}
        image={post.featured_image || '/og-image.png'}
        url={shareUrl}
        type="article"
        schema={[articleSchema, breadcrumbSchema]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Blog', to: '/blog' },
            { label: post.title },
          ]}
        />
        <button onClick={() => navigate('/blog')} className="mb-4 flex items-center text-sm text-gray-600 hover:text-primary-600 font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to blog
        </button>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary-500" />
                <span>{post.author || 'Nimart Team'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary-500" />
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
              {post.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
              )}
            </div>

            {/* Featured image */}
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto max-h-96 object-cover rounded-2xl mb-6 shadow-md"
              />
            )}
          </header>

          {/* Markdown content */}
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 prose-strong:text-gray-900">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <button onClick={handleShare} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700">
              <Share2 className="h-5 w-5" />
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp: any) => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-36 bg-gray-100">
                    {rp.featured_image ? (
                      <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-green-100 flex items-center justify-center text-2xl">📝</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition">{rp.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}