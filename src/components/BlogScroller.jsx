import React, { useEffect, useRef, useState } from 'react';
import { BLOG_POSTS, TAG_STYLES } from '../data/blogPosts';

function BlogCard({ post, onNavigateToBlog }) {
  const style = TAG_STYLES[post.tag] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <button
      onClick={onNavigateToBlog}
      className="flex-none w-64 bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-400 transition-colors block"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: style.bg, color: style.text }}
        >
          {post.tag}
        </span>
        <span className="text-xs text-gray-400">{post.mins} min read</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1.5 leading-snug line-clamp-2">{post.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
    </button>
  );
}

export default function BlogScroller({ onNavigateToBlog }) {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const [paused, setPaused] = useState(false);

  // Double the posts for seamless infinite loop
  const allPosts = [...BLOG_POSTS, ...BLOG_POSTS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.5;

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current += speed;
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const onMouseEnter = () => { pausedRef.current = true; };
    const onMouseLeave = () => { if (!isDraggingRef.current) pausedRef.current = false; };
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startPosRef.current = posRef.current;
      pausedRef.current = true;
      track.style.cursor = 'grabbing';
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      pausedRef.current = false;
      track.style.cursor = 'grab';
    };
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      let next = startPosRef.current - (e.clientX - startXRef.current);
      const half = track.scrollWidth / 2;
      if (next < 0) next += half;
      if (next >= half) next -= half;
      posRef.current = next;
      track.style.transform = `translateX(-${next}px)`;
    };

    track.addEventListener('mouseenter', onMouseEnter);
    track.addEventListener('mouseleave', onMouseLeave);
    track.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener('mouseenter', onMouseEnter);
      track.removeEventListener('mouseleave', onMouseLeave);
      track.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    pausedRef.current = next;
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">From the Blog</p>
          <h3 className="text-lg font-bold text-gray-800">Guides &amp; compliance resources</h3>
        </div>
        <button
          onClick={onNavigateToBlog}
          className="text-sm text-green-700 font-semibold border border-green-300 rounded-lg px-4 py-1.5 hover:bg-green-50 transition-colors"
        >
          View all →
        </button>
      </div>

      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform"
          style={{ cursor: 'grab' }}
        >
          {allPosts.map((post, i) => (
            <BlogCard key={i} post={post} onNavigateToBlog={onNavigateToBlog} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={togglePause}
          className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <span className="text-xs text-gray-400">Hover or drag to browse</span>
      </div>
    </div>
  );
}
