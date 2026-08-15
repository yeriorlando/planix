import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
  CornerDownRight,
  X,
  Send,
  Award,
  Shield,
  Sparkles,
  Clock,
  Compass,
  Link as LinkIcon,
  Smile,
  Globe,
  Eye,
  Lock,
  Trophy,
  Users,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlertTriangle,
  Crown
} from 'lucide-react';
import {
  getCurrentUser,
  getCommunityPosts,
  saveCommunityPost,
  deleteCommunityPost,
  uid,
  CommunityPost,
  getUsers,
  saveUsuariosBatch,
  type Usuario
} from '../lib/storage';
import { toast } from 'sonner';
import { requestD1 } from '../lib/services/d1Client';
import { logActivity } from '../lib/activityLog';
import { mapProfile } from '../lib/services/auth';
import AmbassadorBadge from '../components/ui/AmbassadorBadge';
import MedalStar from '../components/ui/MedalStar';

// Helper to generate a unique gradient for the user avatar based on their name
function getAvatarGradient(name: string) {
  const safeName = name || 'Usuario';
  const gradients = [
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-pink-400 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-blue-500'
  ];
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// Client-side link preview detector
function detectLink(text: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  if (match) {
    const url = match[0];
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch (e) {
      domain = url;
    }

    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const youtubeMatch = url.match(regExp);
      const youtubeId = (youtubeMatch && youtubeMatch[2].length === 11) ? youtubeMatch[2] : null;
      return {
        url,
        title: 'Video Educativo en YouTube',
        description: 'Recurso audiovisual compartido para complementar la planificación docente.',
        domain: 'youtube.com',
        youtubeId
      };
    }
    if (domain.includes('minerd.gob.do') || domain.includes('minerd.gob')) {
      return {
        url,
        title: 'Ministerio de Educación de la República Dominicana',
        description: 'Documentos oficiales, adecuación curricular y ordenanzas pedagógicas.',
        domain: 'minerd.gob.do'
      };
    }
    if (domain.includes('drive.google.com')) {
      return {
        url,
        title: 'Recurso en Google Drive',
        description: 'Carpeta compartida con materiales didácticos, plantillas y exámenes.',
        domain: 'drive.google.com'
      };
    }
    if (domain.includes('canva.com')) {
      return {
        url,
        title: 'Plantilla de Presentación en Canva',
        description: 'Diseño educativo interactivo listo para presentar en el aula.',
        domain: 'canva.com'
      };
    }
    if (domain.includes('kahoot.it') || domain.includes('kahoot.com')) {
      return {
        url,
        title: 'Cuestionario Kahoot! Interactivo',
        description: 'Actividad de gamificación y evaluación formativa para los estudiantes.',
        domain: 'kahoot.com'
      };
    }
    return {
      url,
      title: 'Enlace externo compartido',
      description: `Visita ${domain} para ver el recurso completo compartido por el docente.`,
      domain
    };
  }
  return null;
}

// Helper to strip youtube urls from text rendering
function stripYoutubeUrl(text: string): string {
  if (!text) return "";
  const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)/g;
  return text.replace(urlRegex, '').trim();
}

// Helper to render bold, italic, and blue color highlighted text
function renderFormattedContent(text: string) {
  if (!text) return "";

  const regex = /(\*\*.*?\*\*|\*.*?\*|\[blue\].*?\[\/blue\])/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-zinc-800 dark:text-zinc-200">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('[blue]') && part.endsWith('[/blue]')) {
      return <span key={i} className="text-[#1e88e5] font-bold">{part.slice(6, -7)}</span>;
    }
    return part;
  });
}

// YouTube dynamic preview loader
function YouTubePreview({ url, youtubeId }: { url: string; youtubeId: string }) {
  const [videoTitle, setVideoTitle] = useState('Cargando título del video...');
  const [videoDescription, setVideoDescription] = useState('Cargando descripción...');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let active = true;
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${youtubeId}`)
      .then(res => res.json())
      .then(data => {
        if (active) {
          if (data && data.title) {
            setVideoTitle(data.title);
            setVideoDescription(data.author_name ? `Canal: ${data.author_name}` : 'Video educativo en YouTube');
          } else {
            setVideoTitle('Video Educativo en YouTube');
            setVideoDescription('Recurso audiovisual compartido para complementar la planificación docente.');
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setVideoTitle('Video Educativo en YouTube');
          setVideoDescription('Recurso audiovisual compartido para complementar la planificación docente.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [youtubeId]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-row rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 shadow-sm max-w-lg transition-colors group/yt w-full"
    >
      {/* Left side: Video thumbnail with a Play Button Overlay */}
      <div className="relative w-32 h-20 sm:w-40 sm:h-24 shrink-0 bg-black overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
          alt={videoTitle}
          className="w-full h-full object-cover group-hover/yt:scale-105 transition-transform duration-300"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover/yt:bg-black/30 transition-colors">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/yt:scale-110">
            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side: Video Title, Description, and Link */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          <h4 className="text-[12.5px] font-bold text-zinc-850 dark:text-zinc-100 line-clamp-2 mb-0.5 leading-snug group-hover/yt:text-[#1e88e5] transition-colors">
            {videoTitle}
          </h4>
          <p className="text-[10.5px] text-zinc-550 dark:text-zinc-400 line-clamp-1 leading-relaxed">
            {videoDescription}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 truncate">
            <img src="https://www.google.com/s2/favicons?sz=32&domain=youtube.com" className="w-3.5 h-3.5 shrink-0" alt="YT" />
            youtube.com
          </span>
          <span className="text-[9.5px] font-extrabold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full shrink-0 transition-colors">
            Ver Video
          </span>
        </div>
      </div>
    </a>
  );
}

const QUICK_EMOJIS = [
  // Académicos y Educación
  '📚', '🎓', '📝', '✏️', '📖', '🏫', '🍎', '💡', '🧠', '🧪',
  '📐', '🌍', '🔬', '💻', '🎨', '🎼', '🎭', '🗣️', '🧭', '🧮',
  // Motivación y Logros
  '🌟', '⭐', '🏆', '🥇', '👏', '🙌', '💪', '🚀', '🎯', '🤝',
  // Comunicación y Marcadores
  '📢', '📌', '🗓️', '✅', '❤️', '👍', '😊', '🙏', '💭', '✨'
];

export default function Comunidad() {
  const navigate = useNavigate();

  const [user, setUser] = useState<Usuario>(() => {
    const curr = getCurrentUser();
    return curr || ({
      id: 'guest_user',
      nombre: 'Docente Planix',
      rol: 'teacher',
      suscripcion: 'free',
      estado_suscripcion: 'ACTIVO',
      suscripcion_hasta: new Date().toISOString(),
      creado_en: new Date().toISOString(),
      avatar_url: undefined
    } as Usuario);
  });

  const [allUsers, setAllUsers] = useState<Usuario[]>(() => getUsers());

  // Listen to user changes (e.g. avatar or profile updates)
  useEffect(() => {
    const handleUserChanged = () => {
      const curr = getCurrentUser();
      if (curr) setUser(curr);
      setAllUsers(getUsers());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("plx:user_changed", handleUserChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("plx:user_changed", handleUserChanged);
      }
    };
  }, []);

  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const [activeTab, setActiveTab] = useState<'para-ti' | 'marcadores'>('para-ti');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const userObj = getCurrentUser();
    const userName = userObj?.nombre || userObj?.email || 'Docente';
    void logActivity({
      kind: 'tool',
      userName,
      title: 'Comunidad Docente',
      detail: 'Accedió a la Comunidad Docente',
    });
  }, []);

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const existing = getCommunityPosts();

      // Clean up mock demo posts, duplicates, and empty posts from localStorage
      let cleaned = Array.isArray(existing) ? existing : [];
      cleaned = cleaned.filter(p => p && !p.id?.startsWith('mock_') && (p.contenido && p.contenido.trim() !== ''));

      const seenIds = new Set<string>();
      cleaned = cleaned.filter(p => {
        if (!p || !p.id) return false;
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });

      if (!Array.isArray(existing) || cleaned.length !== existing.length) {
        localStorage.setItem("plx:community", JSON.stringify(cleaned));
      }

      // Sanitize community posts to prevent any runtime rendering crashes due to database schema updates
      const sanitized = cleaned.map(p => ({
        ...p,
        likes_count: p.likes_count ?? 0,
        comments_count: p.comments_count ?? 0,
        bookmarks_count: p.bookmarks_count ?? 0,
        views_count: p.views_count ?? 0,
        liked_by: Array.isArray(p.liked_by) ? p.liked_by : [],
        bookmarked_by: Array.isArray(p.bookmarked_by) ? p.bookmarked_by : [],
        creado_en: p.creado_en || new Date().toISOString(),
        comentarios: Array.isArray(p.comentarios) ? p.comentarios.map(c => ({
          ...c,
          creado_en: c.creado_en || new Date().toISOString(),
          respuestas: Array.isArray(c.respuestas) ? c.respuestas : []
        })) : []
      }));

      return sanitized.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    } catch (e) {
      console.error("Error loading community posts from localStorage:", e);
      return [];
    }
  });

  const [newPostText, setNewPostText] = useState("");
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close the emoji picker card
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        const trigger = event.target as HTMLElement;
        if (!trigger.closest('.emoji-trigger-btn')) {
          setShowEmojiPicker(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Synchronize community posts and profiles with D1 remote database on mount
  useEffect(() => {
    async function loadFromD1() {
      try {
        const [d1Posts, d1Profiles] = await Promise.allSettled([
          requestD1<CommunityPost[]>("/api/community-posts"),
          requestD1<any[]>("/api/profiles")
        ]);

        if (d1Profiles.status === 'fulfilled' && Array.isArray(d1Profiles.value) && d1Profiles.value.length > 0) {
          const mappedUsers = d1Profiles.value.map(mapProfile);
          saveUsuariosBatch(mappedUsers);
          setAllUsers(mappedUsers);
        }

        if (d1Posts.status === 'fulfilled' && Array.isArray(d1Posts.value)) {
          // Filter out mock posts and empty posts from API sync
          const validD1Posts = d1Posts.value.filter(p => p && !p.id?.startsWith('mock_') && (p.contenido && p.contenido.trim() !== ''));
          
          // Sync with local cache
          validD1Posts.forEach(saveCommunityPost);
          refreshPosts();
        }
      } catch (err) {
        console.error("Error loading community data from D1:", err);
      }
    }
    loadFromD1();
  }, []);

  // Convert HTML to simple markdown code for storage
  function htmlToMarkdown(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    function processNode(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        let innerText = '';

        for (let i = 0; i < el.childNodes.length; i++) {
          innerText += processNode(el.childNodes[i]);
        }

        if (tagName === 'strong' || tagName === 'b' || el.style.fontWeight === 'bold') {
          return `**${innerText}**`;
        }
        if (tagName === 'em' || tagName === 'i' || el.style.fontStyle === 'italic') {
          return `*${innerText}*`;
        }
        if (tagName === 'span' && (el.style.color === 'rgb(30, 136, 229)' || el.style.color === '#1e88e5' || el.className.includes('text-[#1e88e5]'))) {
          return `[blue]${innerText}[/blue]`;
        }
        if (tagName === 'li') {
          const parentTag = el.parentElement?.tagName.toLowerCase();
          if (parentTag === 'ol') {
            return `\n1. ${innerText}`;
          }
          return `\n- ${innerText}`;
        }
        if (tagName === 'ul' || tagName === 'ol') {
          return innerText;
        }
        if (tagName === 'p' || tagName === 'div' || tagName === 'br') {
          return `\n${innerText}`;
        }
        return innerText;
      }
      return '';
    }

    let text = processNode(temp);
    text = text.replace(/^\n+/, '').replace(/\n+$/, '');
    return text;
  }

  function handleEditorInput() {
    if (!editorRef.current) return;
    const text = htmlToMarkdown(editorRef.current.innerHTML);
    setNewPostText(text);
  }

  function insertEmojiAtCursor(emoji: string) {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(emoji);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    handleEditorInput();
  }

  function insertHashtagAtCursor() {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode('#');
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    handleEditorInput();
  }

  function updateToolbarPosition() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setShowFormatToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (editorRef.current) {
      const parentRect = editorRef.current.getBoundingClientRect();
      const left = rect.left - parentRect.left + (rect.width / 2);
      const top = rect.top - parentRect.top - 48; // 48px above the selection

      setToolbarPos({ top, left });
      setShowFormatToolbar(true);
    }
  }

  function handleEditorSelection() {
    setTimeout(() => {
      updateToolbarPosition();
    }, 10);
  }
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyTarget, setReplyTarget] = useState<Record<string, { commentId: string, authorName: string } | null>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  function refreshPosts() {
    try {
      const all = getCommunityPosts();

      // Clean up mock demo posts, duplicates, and empty posts from localStorage
      let cleaned = Array.isArray(all) ? all : [];
      cleaned = cleaned.filter(p => p && !p.id?.startsWith('mock_') && (p.contenido && p.contenido.trim() !== ''));

      const seenIds = new Set<string>();
      cleaned = cleaned.filter(p => {
        if (!p || !p.id) return false;
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });

      if (!Array.isArray(all) || cleaned.length !== all.length) {
        localStorage.setItem("plx:community", JSON.stringify(cleaned));
      }

      const sanitized = cleaned.map(p => ({
        ...p,
        likes_count: p.likes_count ?? 0,
        comments_count: p.comments_count ?? 0,
        bookmarks_count: p.bookmarks_count ?? 0,
        views_count: p.views_count ?? 0,
        liked_by: Array.isArray(p.liked_by) ? p.liked_by : [],
        bookmarked_by: Array.isArray(p.bookmarked_by) ? p.bookmarked_by : [],
        creado_en: p.creado_en || new Date().toISOString(),
        comentarios: Array.isArray(p.comentarios) ? p.comentarios.map(c => ({
          ...c,
          creado_en: c.creado_en || new Date().toISOString(),
          respuestas: Array.isArray(c.respuestas) ? c.respuestas : []
        })) : []
      }));
      setPosts(sanitized.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()));
    } catch (e) {
      console.error("Error refreshing posts:", e);
    }
  }

  function handleCreatePost() {
    if (!newPostText.trim()) {
      toast.error("El contenido de la publicación no puede estar vacío.");
      return;
    }

    const isUserAdmin = user.rol === "admin" || user.rol === "administrador" || user.email?.toLowerCase() === "admin@planix.do" || user.email?.toLowerCase() === "reyna.mancebo@docente.edu.do";
    const isUserCoordinator = user.rol === "coordinator" || user.rol === "coordinador";

    const post: CommunityPost = {
      id: uid("pst"),
      docente_id: user.id,
      docente_nombre: user.nombre,
      docente_rol: isUserAdmin 
        ? "Administrador" 
        : isUserCoordinator
          ? "Coordinador"
          : user.nivel 
            ? user.nivel.charAt(0).toUpperCase() + user.nivel.slice(1)
            : "Docente",
      docente_avatar: user.avatar_url,
      is_ambassador: !!user.is_ambassador,
      contenido: newPostText,
      likes_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      views_count: 1,
      liked_by: [],
      bookmarked_by: [],
      creado_en: new Date().toISOString(),
      comentarios: [],
      comments_disabled: commentsDisabled,
    };

    saveCommunityPost(post);
    setNewPostText("");
    setCommentsDisabled(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    refreshPosts();
    toast.success("¡Publicación compartida con la comunidad!");

    // Sync to D1
    requestD1("/api/community-posts", "POST", post).catch(err => {
      console.error("Error saving post to D1:", err);
    });
  }

  function handleToggleLike(postId: string) {
    const all = getCommunityPosts();
    const idx = all.findIndex((x) => x.id === postId);
    if (idx >= 0) {
      const post = all[idx];
      const likedBy = Array.isArray(post.liked_by) ? post.liked_by : [];
      const likedIdx = likedBy.indexOf(user.id);
      if (likedIdx >= 0) {
        likedBy.splice(likedIdx, 1);
        post.likes_count = Math.max(0, (post.likes_count ?? 1) - 1);
      } else {
        likedBy.push(user.id);
        post.likes_count = (post.likes_count ?? 0) + 1;
      }
      post.liked_by = likedBy;
      saveCommunityPost(post);
      refreshPosts();

      // Sync to D1
      requestD1("/api/community-posts", "POST", post).catch(err => {
        console.error("Error toggling like in D1:", err);
      });
    }
  }

  function handleToggleBookmark(postId: string) {
    const all = getCommunityPosts();
    const idx = all.findIndex((x) => x.id === postId);
    if (idx >= 0) {
      const post = all[idx];
      const bookmarkedBy = Array.isArray(post.bookmarked_by) ? post.bookmarked_by : [];
      const bookIdx = bookmarkedBy.indexOf(user.id);
      if (bookIdx >= 0) {
        bookmarkedBy.splice(bookIdx, 1);
        post.bookmarks_count = Math.max(0, (post.bookmarks_count ?? 1) - 1);
      } else {
        bookmarkedBy.push(user.id);
        post.bookmarks_count = (post.bookmarks_count ?? 0) + 1;
      }
      post.bookmarked_by = bookmarkedBy;
      saveCommunityPost(post);
      refreshPosts();
      toast.success(bookIdx >= 0 ? "Removida de marcadores." : "¡Guardada en tus marcadores!");

      // Sync to D1
      requestD1("/api/community-posts", "POST", post).catch(err => {
        console.error("Error toggling bookmark in D1:", err);
      });
    }
  }

  function handleAddCommentOrReply(postId: string) {
    const txt = commentInputs[postId] || "";
    if (!txt.trim()) return;

    const all = getCommunityPosts();
    const idx = all.findIndex((x) => x.id === postId);
    if (idx < 0) return;

    const post = all[idx];
    const target = replyTarget[postId];

    // Ensure comentarios is initialized
    if (!Array.isArray(post.comentarios)) {
      post.comentarios = [];
    }

    if (target) {
      const commentIdx = post.comentarios.findIndex(c => c.id === target.commentId);
      if (commentIdx >= 0) {
        const comment = post.comentarios[commentIdx];
        if (!Array.isArray(comment.respuestas)) {
          comment.respuestas = [];
        }
        comment.respuestas.push({
          id: uid("rpl"),
          docente_id: user.id,
          docente_nombre: user.nombre,
          docente_avatar: user.avatar_url,
          contenido: txt,
          creado_en: new Date().toISOString()
        } as any);

        post.comments_count = (post.comments_count ?? 0) + 1;
        saveCommunityPost(post);
        refreshPosts();

        setReplyTarget(prev => ({ ...prev, [postId]: null }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        toast.success("Respuesta publicada.");

        // Sync to D1
        requestD1("/api/community-posts", "POST", post).catch(err => {
          console.error("Error saving reply in D1:", err);
        });
      }
    } else {
      post.comentarios.push({
        id: uid("cmt"),
        docente_id: user.id,
        docente_nombre: user.nombre,
        docente_avatar: user.avatar_url,
        contenido: txt,
        creado_en: new Date().toISOString(),
        respuestas: []
      } as any);

      post.comments_count = (post.comments_count ?? 0) + 1;
      saveCommunityPost(post);
      refreshPosts();
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comentario publicado.");

      // Sync to D1
      requestD1("/api/community-posts", "POST", post).catch(err => {
        console.error("Error saving comment in D1:", err);
      });
    }
  }

  function handleDeletePost(postId: string) {
    setPostToDelete(postId);
  }

  function toggleComments(postId: string) {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }

  function formatTime(isoString: string) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString("es-DO", {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function insertEmoji(emoji: string) {
    setNewPostText(prev => prev + emoji);
    setShowEmojiPicker(false);
    editorRef.current?.focus();
  }

  const displayedPosts = posts.filter(post => {
    if (activeTab === 'marcadores') {
      const bookmarkedBy = Array.isArray(post.bookmarked_by) ? post.bookmarked_by : [];
      return bookmarkedBy.includes(user.id);
    }
    return true;
  });

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    } min-h-screen relative transition-all duration-150`}>

      {/* Centered Header Section (Matching /recursos and /efemerides) */}
      <div className="text-center mb-8 flex flex-col items-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B1B1B] dark:text-white tracking-tight mb-2">
          Comunidad docente
        </h1>
        <p className="text-[15px] md:text-[17px] font-medium text-slate-400 tracking-tight max-w-[650px] leading-relaxed">
          Comparte estrategias didácticas, recursos educativos y conecta con otros docentes.
        </p>
      </div>

      {/* Tabs / Filter Bar (Pill style centered with original motion sliding effect) */}
      <div className="flex items-center justify-center gap-2 mb-8 bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-full w-fit mx-auto select-none border border-black/5 dark:border-white/5">
        <button
          onClick={() => setActiveTab('para-ti')}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {activeTab === 'para-ti' && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />
          )}
          <Compass className={`w-3.5 h-3.5 relative z-10 transition-colors duration-300 ${activeTab === 'para-ti' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'}`} />
          <span className={`relative z-10 transition-colors duration-300 ${activeTab === 'para-ti' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'}`}>
            Para ti
          </span>
        </button>

        <button
          onClick={() => setActiveTab('marcadores')}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {activeTab === 'marcadores' && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />
          )}
          <Bookmark className={`w-3.5 h-3.5 relative z-10 transition-colors duration-300 ${activeTab === 'marcadores' ? 'text-white fill-white/10' : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'}`} />
          <span className={`relative z-10 transition-colors duration-300 ${activeTab === 'marcadores' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'}`}>
            Mis Marcadores
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 w-full max-w-5xl mx-auto gap-6 flex-1">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Create Post Section - Card Style */}
          {activeTab === 'para-ti' && (
            <div className="bg-white/70 dark:bg-zinc-900/40 rounded-[28px] border border-black/5 dark:border-white/5 p-5 shadow-xs">
              <div className="flex gap-3.5">
                {/* Left Column: Avatar */}
                {user.is_ambassador ? (
                  <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.3)] shrink-0 h-fit self-start">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nombre}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(user.nombre)} flex items-center justify-center text-xs font-black text-white uppercase`}>
                        {user.nombre.substring(0, 2)}
                      </div>
                    )}
                    <div title="Embajador Planix" className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-85 flex items-center justify-center cursor-pointer">
                      <MedalStar size={8} className="text-white fill-white" />
                    </div>
                  </div>
                ) : user.suscripcion === "pro" ? (
                  <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.3)] shrink-0 h-fit self-start">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nombre}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(user.nombre)} flex items-center justify-center text-xs font-black text-white uppercase`}>
                        {user.nombre.substring(0, 2)}
                      </div>
                    )}
                    <div title="Planix Pro" className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-85 cursor-pointer">
                      <Crown className="h-2 w-2 fill-white text-white" />
                    </div>
                  </div>
                ) : user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nombre}
                    className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm border border-zinc-100 dark:border-zinc-800"
                  />
                ) : (
                  <div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${getAvatarGradient(user.nombre)} flex items-center justify-center text-xs font-black text-white uppercase shadow-sm`}>
                    {user.nombre.substring(0, 2)}
                  </div>
                )}

                {/* Right Column: Editor */}
                <div className="flex-1 flex flex-col">
                  {/* CSS styles for ContentEditable placeholder and lists */}
                  <style>{`
                    .rich-editor:empty:before {
                      content: attr(data-placeholder);
                      color: #a1a1aa;
                      pointer-events: none;
                      display: block;
                    }
                    .rich-editor ul {
                      list-style-type: disc;
                      padding-left: 1.25rem;
                      margin-top: 0.25rem;
                      margin-bottom: 0.25rem;
                    }
                    .rich-editor ol {
                      list-style-type: decimal;
                      padding-left: 1.25rem;
                      margin-top: 0.25rem;
                      margin-bottom: 0.25rem;
                    }
                    .rich-editor li {
                      display: list-item;
                    }
                  `}</style>

                  {/* Internal border container wrapper */}
                  <div className="relative border border-zinc-200/70 dark:border-zinc-800/30 rounded-2xl p-3 bg-[#FAFAF8] dark:bg-zinc-900/20 focus-within:border-[#1e88e5]/40 focus-within:ring-2 focus-within:ring-[#1e88e5]/5 transition-all mb-3.5">
                    {/* ContentEditable editor div */}
                    <div
                      ref={editorRef}
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      data-placeholder="¿Qué estrategia o recurso compartes hoy en el aula?"
                      onInput={handleEditorInput}
                      onMouseUp={handleEditorSelection}
                      onKeyUp={handleEditorSelection}
                      className="rich-editor w-full text-[14px] font-medium text-zinc-800 dark:text-zinc-100 bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[85px] leading-relaxed pt-1 outline-none relative"
                    />

                    {/* Floating Selection Formatting Bubble Toolbar (Word-Style) */}
                    {showFormatToolbar && (
                      <div
                        className="absolute z-50 bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                        style={{
                          top: `${toolbarPos.top}px`,
                          left: `${toolbarPos.left}px`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <button
                          onClick={() => {
                            document.execCommand('bold', false);
                            handleEditorInput();
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-650 dark:text-zinc-300 font-extrabold w-7 h-7 flex items-center justify-center text-[12px]"
                          title="Negrita"
                        >
                          B
                        </button>
                        <button
                          onClick={() => {
                            document.execCommand('italic', false);
                            handleEditorInput();
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-650 dark:text-zinc-300 italic w-7 h-7 flex items-center justify-center text-[12px]"
                          title="Itálica"
                        >
                          I
                        </button>
                        <button
                          onClick={() => {
                            document.execCommand('foreColor', false, '#1e88e5');
                            handleEditorInput();
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-[#1e88e5] font-extrabold text-[12px] flex items-center justify-center w-7 h-7"
                          title="Destacar azul"
                        >
                          A
                        </button>
                        <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                        <button
                          onClick={() => {
                            insertHashtagAtCursor();
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-650 dark:text-zinc-300 flex items-center justify-center w-7 h-7 font-extrabold text-[12px]"
                          title="Hashtag"
                        >
                          #
                        </button>
                        <button
                          onClick={() => {
                            document.execCommand('insertUnorderedList', false);
                            handleEditorInput();
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-650 dark:text-zinc-300"
                          title="Lista con viñetas"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            document.execCommand('insertOrderedList', false);
                            handleEditorInput();
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-650 dark:text-zinc-300"
                          title="Lista numerada"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                        <button
                          onClick={() => {
                            insertEmojiAtCursor('🌟');
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-650 dark:text-zinc-300"
                          title="Insertar 🌟"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                        <button
                          onClick={() => {
                            setShowFormatToolbar(false);
                            window.getSelection()?.removeAllRanges();
                          }}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {/* Caret pointing down */}
                        <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200 dark:border-zinc-800" />
                      </div>
                    )}
                  </div>

                  {/* Auto-detected link preview in composer */}
                  {(() => {
                    const composerLinkInfo = detectLink(newPostText);
                    if (!composerLinkInfo) return null;
                    return (
                      <div className="mb-3">
                        {composerLinkInfo.youtubeId ? (
                          <YouTubePreview url={composerLinkInfo.url} youtubeId={composerLinkInfo.youtubeId} />
                        ) : (
                          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 p-3 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-700">
                              <img
                                src={`https://www.google.com/s2/favicons?sz=64&domain=${composerLinkInfo.domain}`}
                                alt={composerLinkInfo.domain}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231e88e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[12px] font-bold text-zinc-850 dark:text-zinc-100 truncate">
                                {composerLinkInfo.title}
                              </h4>
                              <p className="text-[10px] text-zinc-450 truncate">
                                {composerLinkInfo.domain}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Audience/Comments toggler button */}
                  <button
                    onClick={() => setCommentsDisabled(!commentsDisabled)}
                    className={`flex items-center gap-1.5 text-[11px] font-extrabold pb-2.5 border-b border-zinc-100/60 dark:border-zinc-800/40 mb-2.5 w-full text-left transition-colors cursor-pointer select-none ${commentsDisabled
                        ? 'text-rose-500 hover:text-rose-600'
                        : 'text-[#1e88e5] hover:text-[#1565c0]'
                      }`}
                  >
                    {commentsDisabled ? (
                      <>
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Respuestas desactivadas (Solo lectura)</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span>Todos los docentes pueden responder</span>
                      </>
                    )}
                  </button>

                  {/* Toolbar row */}
                  <div className="flex items-center justify-between pt-1">

                    {/* Formatting Tools */}
                    <div className="flex items-center gap-1.5 relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="emoji-trigger-btn p-1.5 rounded-full text-zinc-500 hover:text-[#1e88e5] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Añadir emoji"
                      >
                        <Smile className="w-4.5 h-4.5" />
                      </button>

                      {/* Bold Button */}
                      <button
                        onClick={() => {
                          document.execCommand('bold', false);
                          handleEditorInput();
                        }}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-[#1e88e5] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Negrita"
                      >
                        <Bold className="w-4 h-4" />
                      </button>

                      {/* Italic Button */}
                      <button
                        onClick={() => {
                          document.execCommand('italic', false);
                          handleEditorInput();
                        }}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-[#1e88e5] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Cursiva"
                      >
                        <Italic className="w-4 h-4" />
                      </button>

                      {/* Hashtag Button */}
                      <button
                        onClick={() => {
                          insertHashtagAtCursor();
                        }}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-[#1e88e5] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center w-7 h-7 font-extrabold text-[14px]"
                        title="Hashtag"
                      >
                        #
                      </button>

                      {/* Bullet List Button */}
                      <button
                        onClick={() => {
                          document.execCommand('insertUnorderedList', false);
                          handleEditorInput();
                        }}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-[#1e88e5] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Lista de viñetas"
                      >
                        <List className="w-4 h-4" />
                      </button>

                      {/* Numbered List Button */}
                      <button
                        onClick={() => {
                          document.execCommand('insertOrderedList', false);
                          handleEditorInput();
                        }}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-[#1e88e5] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Lista numerada"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      {/* Dropdown Emoji Picker */}
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute left-0 bottom-9 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-2xl grid grid-cols-8 gap-1.5 w-[290px]"
                        >
                          {QUICK_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                insertEmojiAtCursor(emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[16px] transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold select-none">
                        {newPostText.length} / 280
                      </span>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostText.trim()}
                        className="px-5 py-2 bg-[#1e88e5] hover:bg-[#1565c0] disabled:opacity-50 text-white text-[12.5px] font-extrabold rounded-full shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Feed - Twitter/X Style */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white/70 dark:bg-zinc-900/40 rounded-[28px] border border-black/5 dark:border-white/5 shadow-xs overflow-hidden">
            <AnimatePresence>
              {displayedPosts.map((post) => {
                const likedBy = Array.isArray(post.liked_by) ? post.liked_by : [];
                const bookmarkedBy = Array.isArray(post.bookmarked_by) ? post.bookmarked_by : [];
                const comments = Array.isArray(post.comentarios) ? post.comentarios : [];

                const isLiked = likedBy.includes(user.id);
                const isBookmarked = bookmarkedBy.includes(user.id);
                const showComments = expandedComments[post.id] || false;
                const activeReply = replyTarget[post.id];
                const linkInfo = detectLink(post.contenido);

                const isAuthorCurrentLoggedIn = Boolean(
                  user && user.id !== 'guest_user' && (
                    post.docente_id === user.id ||
                    (post.docente_nombre && user.nombre && post.docente_nombre.trim().toLowerCase() === user.nombre.trim().toLowerCase())
                  )
                );

                const isOwner = Boolean(
                  isAuthorCurrentLoggedIn ||
                  post.docente_id === user.id ||
                  (user && (user.rol === 'admin' || user.rol === 'administrador' || user.email?.toLowerCase() === 'admin@planix.do' || user.email?.toLowerCase() === 'reyna.mancebo@docente.edu.do'))
                );

                const postAuthor = isAuthorCurrentLoggedIn
                  ? user
                  : (allUsers.find((u) => (post.docente_id && u.id === post.docente_id) || (post.docente_nombre && u.nombre?.trim().toLowerCase() === post.docente_nombre.trim().toLowerCase())) || null);

                const postAuthorAvatar = (isAuthorCurrentLoggedIn ? user.avatar_url : (postAuthor?.avatar_url || (post as any).docente_avatar)) || null;

                const isAuthorAdmin = Boolean(
                  (isAuthorCurrentLoggedIn && (user.rol === 'admin' || user.rol === 'administrador' || user.email?.toLowerCase() === 'admin@planix.do' || user.email?.toLowerCase() === 'reyna.mancebo@docente.edu.do')) ||
                  (postAuthor && (postAuthor.rol === 'admin' || postAuthor.rol === 'administrador' || postAuthor.email?.toLowerCase() === 'admin@planix.do' || postAuthor.email?.toLowerCase() === 'reyna.mancebo@docente.edu.do')) ||
                  (post.docente_rol || '').toLowerCase().includes('admin') ||
                  post.docente_id === 'usr_demo_admin' ||
                  post.docente_id === 'system'
                );

                const isAuthorAmbassador = Boolean(
                  (isAuthorCurrentLoggedIn && user.is_ambassador) ||
                  (postAuthor && postAuthor.is_ambassador) ||
                  (post as any).is_ambassador
                );

                const isAuthorPro = Boolean(
                  isAuthorAdmin ||
                  (isAuthorCurrentLoggedIn && (user.suscripcion === 'pro' || isAuthorAdmin)) ||
                  (postAuthor && (postAuthor.suscripcion === 'pro' || postAuthor.rol === 'admin')) ||
                  (post.docente_rol || '').toLowerCase().includes('admin') ||
                  (post.docente_rol || '').toLowerCase().includes('director') ||
                  (post.docente_rol || '').toLowerCase().includes('coord')
                );

                const displayRol = isAuthorAdmin
                  ? 'ADMINISTRADOR'
                  : isAuthorAmbassador
                    ? 'EMBAJADOR'
                    : (postAuthor?.rol === 'coordinator' || postAuthor?.rol === 'coordinador' || (isAuthorCurrentLoggedIn && (user.rol === 'coordinator' || user.rol === 'coordinador')))
                      ? 'COORDINADOR'
                      : (postAuthor?.nivel ? postAuthor.nivel.toUpperCase() : (isAuthorCurrentLoggedIn && user.nivel ? user.nivel.toUpperCase() : (post.docente_rol || 'DOCENTE').toUpperCase()));

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 md:p-5 flex gap-3.5 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    {/* Left Column: Avatar */}
                    <div className="flex flex-col items-center shrink-0">
                      {isAuthorAmbassador ? (
                        <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.35)] shrink-0 h-fit">
                          {postAuthorAvatar ? (
                            <img
                              src={postAuthorAvatar}
                              alt={post.docente_nombre || 'Docente'}
                              className="h-9 w-9 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                if (fb) fb.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: postAuthorAvatar ? 'none' : 'flex' }}
                            className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(post.docente_nombre || 'Docente')} items-center justify-center text-xs font-black text-white uppercase`}
                          >
                            {(post.docente_nombre || 'Docente').substring(0, 2)}
                          </div>
                          <div title="Embajador Planix" className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-85 flex items-center justify-center cursor-pointer">
                            <MedalStar size={8} className="text-white fill-white" />
                          </div>
                        </div>
                      ) : isAuthorPro ? (
                        <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.35)] shrink-0 h-fit">
                          {postAuthorAvatar ? (
                            <img
                              src={postAuthorAvatar}
                              alt={post.docente_nombre || 'Docente'}
                              className="h-9 w-9 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                if (fb) fb.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: postAuthorAvatar ? 'none' : 'flex' }}
                            className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(post.docente_nombre || 'Docente')} items-center justify-center text-xs font-black text-white uppercase`}
                          >
                            {(post.docente_nombre || 'Docente').substring(0, 2)}
                          </div>
                          <div title="Planix Pro / Administrador" className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-85 cursor-pointer">
                            <Crown className="h-2.5 w-2.5 fill-white text-white" />
                          </div>
                        </div>
                      ) : postAuthorAvatar ? (
                        <div className="relative">
                          <img
                            src={postAuthorAvatar}
                            alt={post.docente_nombre || 'Docente'}
                            className="h-9 w-9 rounded-full object-cover shadow-sm border border-zinc-100 dark:border-zinc-800"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                          <div
                            style={{ display: 'none' }}
                            className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(post.docente_nombre || 'Docente')} items-center justify-center text-xs font-black text-white uppercase shadow-sm`}
                          >
                            {(post.docente_nombre || 'Docente').substring(0, 2)}
                          </div>
                        </div>
                      ) : (
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(post.docente_nombre || 'Docente')} flex items-center justify-center text-xs font-black text-white uppercase shadow-sm`}>
                          {(post.docente_nombre || 'Docente').substring(0, 2)}
                        </div>
                      )}

                      {/* Thread line if comments are expanded */}
                      {showComments && comments.length > 0 && (
                        <div className="w-0.5 flex-1 bg-zinc-100 dark:bg-zinc-800 my-2" />
                      )}
                    </div>

                    {/* Right Column: Tweet Content & Actions */}
                    <div className="flex-1 min-w-0">

                      {/* Header row */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="font-extrabold text-[13.5px] text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
                            {post.docente_nombre || 'Docente'}
                            {isAuthorAmbassador ? (
                              <span title="Embajador Planix" className="inline-flex items-center cursor-pointer shrink-0">
                                <MedalStar size={14} className="text-amber-500 fill-amber-500 hover:scale-110 transition-transform shrink-0" />
                              </span>
                            ) : isAuthorPro ? (
                              <span title="Planix Pro / Administrador" className="inline-flex items-center cursor-pointer shrink-0">
                                <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-500 hover:scale-110 transition-transform" />
                              </span>
                            ) : null}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            isAuthorAdmin
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/40'
                              : isAuthorAmbassador
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40'
                                : displayRol.includes('COORD') || displayRol.includes('DIRECTOR')
                                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/40'
                                  : 'bg-blue-50 dark:bg-blue-950/30 text-[#1e88e5] dark:text-blue-400'
                          }`}>
                            {displayRol}
                          </span>
                          {!!post.comments_disabled && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-450 border border-rose-100/50 dark:border-rose-900/30">
                              <Lock className="w-2 h-2 shrink-0" />
                              Solo Lectura
                            </span>
                          )}
                          <span className="text-zinc-300 dark:text-zinc-700 text-xs">·</span>
                          <span className="text-[11px] text-zinc-400 font-bold">
                            {formatTime(post.creado_en)}
                          </span>
                        </div>

                        {isOwner && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Eliminar publicación"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Content Paragraph */}
                      <p className="text-[13.5px] font-medium leading-relaxed text-zinc-700 dark:text-zinc-200 mb-3 whitespace-pre-wrap break-words">
                        {renderFormattedContent((linkInfo && linkInfo.youtubeId) ? stripYoutubeUrl(post.contenido) : post.contenido)}
                      </p>

                      {/* Embedded Link Preview (Kokonut UI inspired) */}
                      {linkInfo && (
                        <div className="mb-3.5">
                          {linkInfo.youtubeId ? (
                            <YouTubePreview url={linkInfo.url} youtubeId={linkInfo.youtubeId} />
                          ) : (
                            <a
                              href={linkInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors overflow-hidden"
                            >
                              <div className="p-3.5 flex items-center gap-3">
                                <div className="w-9 h-9 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-700">
                                  <img
                                    src={`https://www.google.com/s2/favicons?sz=64&domain=${linkInfo.domain}`}
                                    alt={linkInfo.domain}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231e88e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[12.5px] font-bold text-zinc-850 dark:text-zinc-100 truncate mb-0.5">
                                    {linkInfo.title}
                                  </h4>
                                  <p className="text-[10.5px] text-zinc-550 dark:text-zinc-400 line-clamp-1">
                                    {linkInfo.description}
                                  </p>
                                  <span className="text-[9.5px] text-zinc-400 font-bold uppercase mt-1 block">
                                    {linkInfo.domain}
                                  </span>
                                </div>
                              </div>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action Engagement row - Twitter/X Style */}
                      <div className="flex items-center justify-between text-zinc-400 max-w-md pt-1">

                        {/* Comments */}
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-2 text-[11.5px] font-bold hover:text-[#1e88e5] transition-colors`}
                        >
                          <MessageCircle className="w-4.5 h-4.5" />
                          <span>{post.comments_count ?? 0}</span>
                        </button>

                        {/* Likes */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-2 text-[11.5px] font-bold hover:text-rose-500 transition-colors ${isLiked ? "text-rose-500" : ""
                            }`}
                        >
                          <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-current scale-105" : ""}`} />
                          <span>{post.likes_count ?? 0}</span>
                        </button>

                        {/* Views */}
                        <div className="flex items-center gap-2 text-[11.5px] font-bold cursor-default hover:text-[#1e88e5]">
                          <Eye className="w-4.5 h-4.5" />
                          <span>{post.views_count ?? 0}</span>
                        </div>

                        {/* Bookmark */}
                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className={`p-1 hover:text-amber-500 transition-colors ${isBookmarked ? "text-amber-500" : ""
                            }`}
                        >
                          <Bookmark className={`w-4.5 h-4.5 ${isBookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Threads comments area */}
                      {showComments && (
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">

                          {/* Thread list */}
                          <div className="space-y-4">
                            {comments.map((cmt) => {
                              const respuestas = Array.isArray(cmt.respuestas) ? cmt.respuestas : [];
                              const isCmtCurrentUser = Boolean(
                                user && user.id !== 'guest_user' && (
                                  (cmt as any).docente_id === user.id ||
                                  (cmt.docente_nombre && user.nombre && cmt.docente_nombre.trim().toLowerCase() === user.nombre.trim().toLowerCase())
                                )
                              );
                              const cmtAuthor = isCmtCurrentUser ? user : (allUsers.find((u) => u.nombre?.trim().toLowerCase() === cmt.docente_nombre?.trim().toLowerCase() || ((cmt as any).docente_id && u.id === (cmt as any).docente_id)) || null);
                              const cmtAuthorAvatar = (isCmtCurrentUser ? user.avatar_url : (cmtAuthor?.avatar_url || (cmt as any).docente_avatar)) || null;

                              return (
                                <div key={cmt.id} className="space-y-3">
                                  {/* Single Tweet-style comment */}
                                  <div className="flex gap-2.5">
                                    {cmtAuthorAvatar ? (
                                      <div className="relative shrink-0">
                                        <img
                                          src={cmtAuthorAvatar}
                                          alt={cmt.docente_nombre || 'Docente'}
                                          className="h-7 w-7 rounded-full object-cover shadow-sm border border-zinc-100 dark:border-zinc-800"
                                          onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                            const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                            if (fb) fb.style.display = 'flex';
                                          }}
                                        />
                                        <div
                                          style={{ display: 'none' }}
                                          className={`h-7 w-7 rounded-full bg-gradient-to-br ${getAvatarGradient(cmt.docente_nombre || 'Docente')} items-center justify-center text-[10px] font-black text-white uppercase shadow-sm`}
                                        >
                                          {(cmt.docente_nombre || 'Docente').substring(0, 2)}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={`h-7 w-7 shrink-0 rounded-full bg-gradient-to-br ${getAvatarGradient(cmt.docente_nombre || 'Docente')} flex items-center justify-center text-[10px] font-black text-white uppercase shadow-sm`}>
                                        {(cmt.docente_nombre || 'Docente').substring(0, 2)}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0 bg-[#FAFAF8] dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs">
                                      <div className="flex justify-between items-center mb-1 flex-wrap">
                                        <span className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100">{cmt.docente_nombre || 'Docente'}</span>
                                        <span className="text-[9.5px] text-zinc-400 font-bold">
                                          {cmt.creado_en ? new Date(cmt.creado_en).toLocaleDateString("es-DO", { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                      </div>
                                      <p className="text-[12.5px] text-zinc-650 dark:text-zinc-300 font-medium break-words leading-relaxed">
                                        {renderFormattedContent(cmt.contenido)}
                                      </p>

                                      <div className="mt-2 flex items-center justify-end">
                                        <button
                                          onClick={() => setReplyTarget(prev => ({
                                            ...prev,
                                            [post.id]: { commentId: cmt.id, authorName: cmt.docente_nombre || 'Docente' }
                                          }))}
                                          className="text-[10px] font-bold text-[#1e88e5] hover:text-[#1565c0] transition-colors flex items-center gap-0.5"
                                        >
                                          <CornerDownRight className="w-3.5 h-3.5" />
                                          Responder
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Curving sub-replies */}
                                  {respuestas.map((reply: any) => {
                                    const isReplyCurrentUser = Boolean(
                                      user && user.id !== 'guest_user' && (
                                        (reply as any).docente_id === user.id ||
                                        (reply.docente_nombre && user.nombre && reply.docente_nombre.trim().toLowerCase() === user.nombre.trim().toLowerCase())
                                      )
                                    );
                                    const replyAuthor = isReplyCurrentUser ? user : (allUsers.find((u) => u.nombre?.trim().toLowerCase() === reply.docente_nombre?.trim().toLowerCase() || ((reply as any).docente_id && u.id === (reply as any).docente_id)) || null);
                                    const replyAuthorAvatar = (isReplyCurrentUser ? user.avatar_url : (replyAuthor?.avatar_url || (reply as any).docente_avatar)) || null;

                                    return (
                                      <div key={reply.id} className="flex gap-2.5 pl-6 md:pl-8 items-start">
                                        <CornerDownRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0 mt-2" />
                                        {replyAuthorAvatar ? (
                                          <div className="relative shrink-0 mt-1">
                                            <img
                                              src={replyAuthorAvatar}
                                              alt={reply.docente_nombre || 'Docente'}
                                              className="h-6.5 w-6.5 rounded-full object-cover shadow-sm border border-zinc-100 dark:border-zinc-800"
                                              onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                                const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                                if (fb) fb.style.display = 'flex';
                                              }}
                                            />
                                            <div
                                              style={{ display: 'none' }}
                                              className={`h-6.5 w-6.5 rounded-full bg-gradient-to-br ${getAvatarGradient(reply.docente_nombre || 'Docente')} items-center justify-center text-[8.5px] font-black text-white uppercase shadow-sm`}
                                            >
                                              {(reply.docente_nombre || 'Docente').substring(0, 2)}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className={`h-6.5 w-6.5 shrink-0 rounded-full bg-gradient-to-br ${getAvatarGradient(reply.docente_nombre || 'Docente')} flex items-center justify-center text-[8.5px] font-black text-white uppercase mt-1 shadow-sm`}>
                                            {(reply.docente_nombre || 'Docente').substring(0, 2)}
                                          </div>
                                        )}
                                        <div className="flex-1 bg-[#FAFAF8] dark:bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/50 shadow-3xs">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-extrabold text-[11.5px] text-zinc-900 dark:text-zinc-205 flex items-center gap-1.5">
                                              {reply.docente_nombre || 'Docente'}
                                              <span className="text-[7.5px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded">Respuesta</span>
                                            </span>
                                            <span className="text-[9px] text-zinc-450 font-bold">
                                              {reply.creado_en ? new Date(reply.creado_en).toLocaleDateString("es-DO", { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                          </div>
                                          <p className="text-[12px] text-zinc-650 dark:text-zinc-300 font-medium break-words leading-relaxed">
                                            {renderFormattedContent(reply.contenido)}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}

                            {comments.length === 0 && (
                              <p className="text-[11.5px] text-zinc-450 italic text-center py-2">Nadie ha respondido aún. ¡Inicia la conversación!</p>
                            )}
                          </div>

                          {post.comments_disabled ? (
                            <div className="flex items-center gap-2.5 justify-center py-3.5 px-5 bg-rose-50/60 dark:bg-rose-950/10 border border-rose-200/70 dark:border-rose-900/30 rounded-2xl text-[11.5px] font-bold text-rose-500/80 dark:text-rose-400/70 select-none">
                              <Lock className="w-3.5 h-3.5 shrink-0 text-rose-400/70" />
                              <span>Las respuestas han sido desactivadas para esta publicación.</span>
                            </div>
                          ) : (
                            <>
                              {/* Replying banner chip */}
                              {activeReply && (
                                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[10px] text-[#1e88e5] font-bold">
                                  <span className="flex items-center gap-1">
                                    <CornerDownRight className="w-3 h-3" />
                                    Respondiendo a: <strong>{activeReply.authorName}</strong>
                                  </span>
                                  <button
                                    onClick={() => setReplyTarget(prev => ({ ...prev, [post.id]: null }))}
                                    className="text-zinc-400 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {/* Reply composer bar */}
                              <div className="flex gap-2.5">
                                <input
                                  placeholder={activeReply ? `Responde a ${activeReply.authorName}...` : "Escribe una respuesta..."}
                                  value={commentInputs[post.id] || ""}
                                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                  className="flex-1 text-[12.5px] font-semibold text-zinc-850 dark:text-zinc-150 bg-[#FAFAF8] dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e88e5]/10 focus:border-[#1e88e5]/40 placeholder-zinc-400 transition-all"
                                  onKeyDown={(e) => e.key === "Enter" && handleAddCommentOrReply(post.id)}
                                />
                                <button
                                  onClick={() => handleAddCommentOrReply(post.id)}
                                  className="px-4 py-1.5 bg-[#1B1B1B] dark:bg-zinc-800 hover:bg-[#2B2B2B] text-white text-[11px] font-bold rounded-full transition-colors cursor-pointer"
                                >
                                  Responder
                                </button>
                              </div>
                            </>
                          )}

                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Column - Dashboard Style Cards */}
        <div className="hidden lg:block lg:col-span-1 p-4 space-y-4">

          {/* Rules Card */}
          <div className="bg-gradient-to-br from-[#EBFBEE] to-[#F3FCF5] dark:from-emerald-950/20 dark:to-zinc-900/40 rounded-[28px] p-6 relative overflow-hidden shadow-sm border border-black/5">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Shield size={18} className="text-emerald-500 fill-emerald-500/10" />
                  <span className="text-[13px] font-bold text-emerald-600 uppercase tracking-wider">Comunidad</span>
                </div>
                <h3 className="text-[20px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">Normas de Convivencia</h3>
                <p className="text-[11px] font-bold text-[#1B1B1B]/40 mt-1.5">Reglas de la red profesional docente</p>
              </div>
              <div className="w-10 h-10 bg-white/60 dark:bg-zinc-800/60 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm shrink-0">
                <Shield size={20} className="text-emerald-600" />
              </div>
            </div>

            <div className="space-y-4 text-[12px] font-medium leading-relaxed text-[#1B1B1B]/70 dark:text-zinc-300 relative z-10 pt-4 border-t border-emerald-500/10">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-emerald-600" />
                </div>
                <p className="leading-tight"><strong className="text-[#1B1B1B] dark:text-white font-extrabold">Colaboración:</strong> Comparte secuencias y recursos pedagógicos libres.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Heart size={14} className="text-emerald-600 fill-emerald-600/10" />
                </div>
                <p className="leading-tight"><strong className="text-[#1B1B1B] dark:text-white font-extrabold">Respeto:</strong> Fomenta críticas didácticas constructivas y reflexivas.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Lock size={14} className="text-emerald-600" />
                </div>
                <p className="leading-tight"><strong className="text-[#1B1B1B] dark:text-white font-extrabold">Privacidad:</strong> Nunca compartas datos privados ni fotos de tus alumnos.</p>
              </div>
            </div>
          </div>

          {/* Insignia Colaborador Card */}
          <div className="bg-gradient-to-tr from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-purple-900/10 rounded-[28px] p-6 relative overflow-hidden shadow-sm border border-black/5">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-3 relative z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Trophy size={18} className="text-indigo-500 fill-indigo-500/10" />
                  <span className="text-[13px] font-bold text-indigo-600 uppercase tracking-wider">Reconocimiento</span>
                </div>
                <h4 className="text-[20px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                  Líder Pedagógico
                </h4>
              </div>
              <div className="w-10 h-10 bg-white/60 dark:bg-zinc-800/60 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm shrink-0">
                <Award size={20} className="text-indigo-600" />
              </div>
            </div>

            <p className="text-[12px] font-medium text-[#1B1B1B]/70 dark:text-zinc-300 leading-relaxed relative z-10 pt-3 border-t border-indigo-500/10">
              Los docentes más activos que comparten estrategias didácticas obtienen la medalla de <strong className="text-indigo-600 dark:text-indigo-400">Colaborador Destacado</strong>.
            </p>
          </div>

        </div>
      </div>

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {postToDelete && (
        <div
          onClick={() => setPostToDelete(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl w-full max-w-[400px] overflow-hidden border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200 relative cursor-default p-6"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFEAF0] to-[#FFF0F5] flex items-center justify-center shadow-sm">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[17px] font-black text-[#1B1B1B] dark:text-white tracking-tight">
                  ¿Confirmar eliminación?
                </h3>
                <p className="text-[12px] font-bold text-[#1B1B1B]/50 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  Esta acción es irreversible y eliminará la publicación permanentemente de la comunidad.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={() => setPostToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-zinc-800 text-[#1B1B1B] dark:text-slate-200 text-[12px] font-bold border border-black/5 dark:border-white/10 hover:bg-[#EBEBEB] dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (postToDelete) {
                      deleteCommunityPost(postToDelete);
                      refreshPosts();
                      
                      // Sync to D1
                      requestD1(`/api/community-posts/${postToDelete}`, "DELETE").catch(err => {
                        console.error("Error deleting post from D1:", err);
                      });

                      setPostToDelete(null);
                      toast.success("Publicación eliminada correctamente.");
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[12px] font-black shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
