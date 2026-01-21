// app/links/blog/page.tsx - COMPLETE FIXED VERSION
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Calendar, Clock, ChevronRight, Search, Tag, User, ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const blogPosts = [
    {
      id: 1,
      title: 'How to Find the Best Service Providers in Nigeria',
      excerpt: 'Learn how to use Nimart to find verified and trusted professionals for your home and business needs.',
      date: '2024-01-15',
      category: 'Tips',
      readTime: '5 min read',
      author: 'Nimart Team',
      image: '/blog/service-providers.jpg',
      tags: ['service providers', 'tips', 'nigeria']
    },
    {
      id: 2,
      title: 'The Rise of the Gig Economy in Nigeria',
      excerpt: 'How service marketplaces are transforming local economies and creating opportunities.',
      date: '2024-01-10',
      category: 'Industry',
      readTime: '7 min read',
      author: 'Chinedu Okoro',
      image: '/blog/gig-economy.jpg',
      tags: ['economy', 'marketplace', 'trends']
    },
    {
      id: 3,
      title: 'Why Verification Matters for Service Professionals',
      excerpt: 'The importance of background checks and verification in building trust with customers.',
      date: '2024-01-05',
      category: 'Safety',
      readTime: '6 min read',
      author: 'Amina Sule',
      image: '/blog/verification.jpg',
      tags: ['verification', 'safety', 'trust']
    },
    {
      id: 4,
      title: 'Top 5 Home Services Nigerians Need Most',
      excerpt: 'Discover the most requested home services and how to find reliable providers.',
      date: '2023-12-28',
      category: 'Home',
      readTime: '8 min read',
      author: 'Nimart Team',
      image: '/blog/home-services.jpg',
      tags: ['home services', 'popular', 'nigeria']
    },
    {
      id: 5,
      title: 'Digital Payments: Making Transactions Safer',
      excerpt: 'How digital payments are revolutionizing service transactions in Nigeria.',
      date: '2023-12-20',
      category: 'Technology',
      readTime: '4 min read',
      author: 'Tech Insights',
      image: '/blog/digital-payments.jpg',
      tags: ['payments', 'technology', 'security']
    },
    {
      id: 6,
      title: 'Building Your Service Business with Nimart',
      excerpt: 'A guide for service providers to grow their business using our platform.',
      date: '2023-12-15',
      category: 'Business',
      readTime: '10 min read',
      author: 'Nimart Team',
      image: '/blog/business-growth.jpg',
      tags: ['business', 'growth', 'providers']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Posts', count: blogPosts.length },
    { id: 'tips', name: 'Tips', count: 2 },
    { id: 'industry', name: 'Industry', count: 1 },
    { id: 'safety', name: 'Safety', count: 1 },
    { id: 'home', name: 'Home', count: 1 },
    { id: 'technology', name: 'Technology', count: 1 },
    { id: 'business', name: 'Business', count: 1 }
  ]

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = activeCategory === 'all' || 
      post.category.toLowerCase() === activeCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredPost = blogPosts[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Nimart Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Insights, tips, and stories about service providers in Nigeria
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Categories */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {activeCategory === 'all' && (
          <div className="mb-12 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                      Featured
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-white/90 mb-6 line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                    <Link
                      href={`/links/blog/${featuredPost.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Read Full Article
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{featuredPost.readTime}</span>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {featuredPost.category}
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">By {featuredPost.author}</span>
                  </div>
                  <p className="text-gray-700 mb-6">
                    {featuredPost.excerpt} Learn more about how Nimart is revolutionizing the service industry in Nigeria.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-blue-600/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-gray-800 text-sm font-medium mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{post.readTime}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">By {post.author}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/links/blog/${post.id}`}
                    className="inline-flex items-center gap-1 text-primary font-medium hover:text-green-700 transition-colors"
                  >
                    Read more
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts found
            </h3>
            <p className="text-gray-600">
              Try a different search term or category
            </p>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated with Nimart
          </h2>
          <p className="text-white/90 mb-6 max-w-md mx-auto">
            Subscribe to our newsletter for the latest blog posts, tips, and updates about service providers in Nigeria.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Your email address"
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-white/70 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Have a story to share?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're always looking for guest contributors, industry insights, and success stories from service providers.
          </p>
          <a
            href="mailto:blog@nimart.ng"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Mail className="h-5 w-5" />
            Contact our editorial team
          </a>
        </div>
      </div>
    </div>
  )
}