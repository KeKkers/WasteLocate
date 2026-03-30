import React, { useState } from 'react';
import { ChevronDown, Home, BookOpen, ExternalLink } from 'lucide-react';
import { BLOG_POSTS, TAG_STYLES } from '../data/blogPosts';

function PostContent({ blocks }) {
  return (
    <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === 'p') return <p key={i}>{block.text}</p>;
        if (block.type === 'h3') return <h3 key={i} className="font-bold text-gray-800 text-base mt-4">{block.text}</h3>;
        if (block.type === 'ul') return (
          <ul key={i} className="list-disc list-inside space-y-1">
            {block.items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        );
        if (block.type === 'links') return (
          <ul key={i} className="space-y-1">
            {block.items.map((link, j) => (
              <li key={j}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  {link.text}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        );
        return null;
      })}
    </div>
  );
}

export default function BlogView({ onBack }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-xl p-8 mb-8 text-white shadow-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-4 text-sm transition-colors"
          >
            <Home className="w-4 h-4" /> Back to WasteLocate
          </button>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7 text-green-200" />
            <h1 className="text-3xl font-bold">WasteLocate Blog</h1>
          </div>
          <p className="text-green-100 text-base">
            Guides, compliance insights and waste industry knowledge for UK businesses.
          </p>
          <p className="text-green-200 text-sm mt-2">{BLOG_POSTS.length} articles</p>
        </div>

        {/* Articles */}
        <div className="space-y-3">
          {BLOG_POSTS.map((post) => {
            const isOpen = openId === post.id;
            const tagStyle = TAG_STYLES[post.tag] || { bg: '#f3f4f6', text: '#374151' };

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Accordion header */}
                <button
                  onClick={() => toggle(post.id)}
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: tagStyle.bg, color: tagStyle.text }}
                      >
                        {post.tag}
                      </span>
                      <span className="text-xs text-gray-400">{post.mins} min read</span>
                      {post.date && (
                        <span className="text-xs text-gray-400">· {post.date}</span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-gray-800 leading-snug">{post.title}</h2>
                    {!isOpen && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="w-full rounded-lg my-4 object-cover max-h-56"
                      />
                    )}
                    <div className="mt-4">
                      <PostContent blocks={post.content} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-white rounded-xl border border-green-200 p-6 text-center shadow-sm">
          <p className="text-gray-600 text-sm mb-3">
            Need to find a permitted facility for your waste? Use our free search tool.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Search Facilities →
          </button>
        </div>

      </div>
    </div>
  );
}
