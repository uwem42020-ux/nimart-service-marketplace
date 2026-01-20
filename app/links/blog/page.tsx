// app/links/blog/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { 
  BookOpen, Calendar, User, Clock, Tag,
  ArrowRight, Home as HomeIcon, Search,
  TrendingUp, Zap, Shield, Heart, Users,
  ChevronLeft, ChevronRight, Share2, Bookmark,
  MessageCircle, Eye, ThumbsUp, Filter
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nimart Blog | Insights on Services, Home Improvement & Professional Tips',
  description: 'Read the Nimart blog for expert tips, service industry insights, home improvement guides, professional advice, and marketplace updates in Nigeria.',
  keywords: 'Nimart blog, service tips Nigeria, home improvement blog, professional advice, marketplace insights, Nigerian services blog, DIY guides, expert tips',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/blog',
    title: 'Nimart Blog | Insights on Services & Home Improvement',
    description: 'Expert tips, industry insights, and professional advice from Nigeria\'s #1 service marketplace',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-blog.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Blog'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nimart Blog | Insights on Services & Home Improvement',
    description: 'Expert tips, industry insights, and professional advice from Nigeria\'s #1 service marketplace',
    images: ['https://nimart.ng/og-blog.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/blog',
  },
}

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: 'How to Choose the Right Electrician for Your Home',
    excerpt: 'Learn the essential factors to consider when hiring an electrician in Nigeria. Safety tips and questions to ask before hiring.',
    author: 'Emeka Nwankwo',
    date: '2024-03-15',
    readTime: '5 min read',
    category: 'Home Improvement',
    tags: ['electricians', 'safety', 'home'],
    image: '/blog/electrician-guide.jpg',
    views: 1250,
    likes: 89,
    comments: 24
  },
  {
    id: 2,
    title: 'The Future of Service Marketplaces in Nigeria',
    excerpt: 'Exploring how technology is transforming the service industry and creating new opportunities for professionals.',
    author: 'Chinedu Okoro',
    date: '2024-03-10',
    readTime: '8 min read',
    category: 'Industry Insights',
    tags: ['technology', 'marketplace', 'future'],
    image: '/blog/future-services.jpg',
    views: 1890,
    likes: 145,
    comments: 42
  },
  {
    id: 3,
    title: '5 Essential Plumbing Maintenance Tips Every Homeowner Should Know',
    excerpt: 'Prevent costly repairs with these simple plumbing maintenance tips from experienced professionals.',
    author: 'Amina Bello',
    date: '2024-03-05',
    readTime: '6 min read',
    category: 'DIY Guides',
    tags: ['plumbing', 'maintenance', 'home'],
    image: '/blog/plumbing-tips.jpg',
    views: 1560,
    likes: 112,
    comments: 31
  },
  {
    id: 4,
    title: 'Building Trust: How Nimart Verifies Service Providers',
    excerpt: 'An inside look at our rigorous verification process to ensure customer safety and satisfaction.',
    author: 'Nimart Team',
    date: '2024-02-28',
    readTime: '7 min read',
    category: 'Behind the Scenes',
    tags: ['verification', 'safety', 'trust'],
    image: '/blog/verification-process.jpg',
    views: 2100,
    likes: 178,
    comments: 56
  },
  {
    id: 5,
    title: 'Seasonal Home Maintenance Checklist for Nigerian Homes',
    excerpt: 'A comprehensive guide to maintaining your home through different seasons and weather conditions.',
    author: 'Oluwaseun Adeyemi',
    date: '2024-02-20',
    readTime: '10 min read',
    category: 'Home Improvement',
    tags: ['maintenance', 'seasonal', 'checklist'],
    image: '/blog/seasonal-maintenance.jpg',
    views: 1780,
    likes: 134,
    comments: 38
  },
  {
    id: 6,
    title: 'How to Start a Successful Service Business in Nigeria',
    excerpt: 'Practical advice for aspiring entrepreneurs looking to start and grow a service business.',
    author: 'Fatima Abdullahi',
    date: '2024-02-15',
    readTime: '9 min read',
    category: 'Business Tips',
    tags: ['entrepreneurship', 'business', 'growth'],
    image: '/blog/service-business.jpg',
    views: 1950,
    likes: 156,
    comments: 47
  }
]

const popularPosts = [
  {
    id: 7,
    title: 'Common Electrical Problems in Nigerian Homes and How to Fix Them',
    category: 'DIY Guides',
    views: 2450
  },
  {
    id: 8,
    title: 'Interview with Top-Rated Mechanic: Secrets to Customer Satisfaction',
    category: 'Success Stories',
    views: 1980
  },
  {
    id: 9,
    title: 'Cost of Home Services in Major Nigerian Cities: 2024 Guide',
    category: 'Industry Insights',
    views: 3120
  }
]

const categories = [
  { name: 'All Categories', count: 42 },
  { name: 'Home Improvement', count: 15 },
  { name: 'DIY Guides', count: 8 },
  { name: 'Industry Insights', count: 7 },
  { name: 'Business Tips', count: 6 },
  { name: 'Success Stories', count: 4 },
  { name: 'Behind the Scenes', count: 2 }
]

const featuredPost = {
  title: 'Transforming Nigeria\'s Service Industry: Our Journey So Far',
  excerpt: 'A deep dive into how Nimart is revolutionizing service delivery in Nigeria and creating economic opportunities for thousands of professionals.',
  author: 'Nimart Team',
  date: '2024-03-20',
  readTime: '12 min read',
  category: 'Company News'
}

export default function BlogPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Nimart Blog',
    description: 'Expert insights on services, home improvement, and professional tips',
    url: 'https://nimart.ng/links/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Nimart',
      logo: 'https://nimart.ng/logo.png'
    },
    blogPost: blogPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author
      },
      image: post.image
    }))
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://nimart.ng'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://nimart.ng/links/blog'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Nimart Blog
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Expert insights, tips, and stories from Nigeria's service industry
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                {featuredPost.category}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  {featuredPost.author}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {featuredPost.date}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {featuredPost.readTime}
                </div>
              </div>
              <button className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                Read Full Article
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary to-blue-600 lg:min-h-[400px] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <div className="text-xl font-bold">Featured Story</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Popular Posts
              </h3>
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div key={post.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-lg mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 hover:text-primary transition-colors mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-3">{post.category}</span>
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
              <p className="text-sm opacity-90 mb-4">
                Get the latest blog posts and industry insights delivered to your inbox
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full bg-white text-primary font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Blog Posts */}
          <div className="lg:w-3/4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                <p className="text-gray-600 mt-1">Expert insights and practical guides</p>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="p-2 rounded-md bg-white shadow-sm">
                    <span className="sr-only">Grid view</span>
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded-md">
                    <span className="sr-only">List view</span>
                    <div className="w-4 h-4 flex flex-col gap-0.5">
                      <div className="bg-gray-400 rounded-sm h-1"></div>
                      <div className="bg-gray-400 rounded-sm h-1"></div>
                      <div className="bg-gray-400 rounded-sm h-1"></div>
                    </div>
                  </button>
                </div>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option>Sort by: Latest</option>
                  <option>Sort by: Popular</option>
                  <option>Sort by: Trending</option>
                </select>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Post Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-900 hover:text-primary transition-colors">
                      <Link href={`/links/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-between">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </button>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${page === 1 ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-2">...</span>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100">
                  12
                </button>
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Explore Topics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dive deeper into specific areas of interest
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Home Services', icon: HomeIcon, count: '25 articles', color: 'bg-blue-100 text-blue-600' },
              { title: 'Professional Tips', icon: Shield, count: '18 articles', color: 'bg-green-100 text-green-600' },
              { title: 'Industry Trends', icon: TrendingUp, count: '15 articles', color: 'bg-purple-100 text-purple-600' },
              { title: 'Success Stories', icon: Heart, count: '12 articles', color: 'bg-red-100 text-red-600' },
              { title: 'DIY Guides', icon: Zap, count: '20 articles', color: 'bg-yellow-100 text-yellow-600' },
              { title: 'Business Growth', icon: Users, count: '16 articles', color: 'bg-indigo-100 text-indigo-600' },
              { title: 'Safety & Standards', icon: Shield, count: '14 articles', color: 'bg-pink-100 text-pink-600' },
              { title: 'Market Insights', icon: TrendingUp, count: '22 articles', color: 'bg-cyan-100 text-cyan-600' }
            ].map((topic, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${topic.color} mb-4`}>
                  <topic.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{topic.title}</h3>
                <div className="text-sm text-gray-500">{topic.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Want to Contribute?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Are you a service professional with insights to share? We're always looking for guest contributors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:blog@nimart.ng"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              <Mail className="h-6 w-6 mr-3" />
              Write for Us
            </a>
            <Link
              href="/links/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
            >
              Contact Editorial Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}