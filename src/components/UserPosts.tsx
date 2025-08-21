import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { Post } from '../services/api'
import './UserPosts.css'

interface UserPostsProps {
  userId: string
  maxPosts?: number
  theme?: any
}

const UserPosts: React.FC<UserPostsProps> = ({ userId, maxPosts = 5, theme }) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserPosts()
  }, [userId])

  const loadUserPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const allPosts = await apiService.getPosts()
      const userPosts = allPosts
        .filter(post => post.id_autor === userId)
        .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
        .slice(0, maxPosts)
      
      setPosts(userPosts)
    } catch (err) {
      setError('Error al cargar las publicaciones')
      console.error('Error cargando publicaciones del usuario:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'Social': '🎉',
      'Deporte': '⚽',
      'Estudio': '📚',
      'Cultural': '🎭',
      'Otro': '📌'
    }
    return icons[type] || '📌'
  }

  const getPrivacyIcon = (privacy: string) => {
    return privacy === 'publica' ? '🌍' : '🔒'
  }

  if (isLoading) {
    return (
      <div className="user-posts-loading">
        <div className="spinner"></div>
        <p>Cargando publicaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-posts-error">
        <p>{error}</p>
        <button onClick={loadUserPosts} className="btn btn-outline-primary btn-sm">
          Reintentar
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="user-posts-empty">
        <div className="empty-icon">📝</div>
        <h4>No hay publicaciones</h4>
        <p>Aún no has creado ninguna publicación</p>
      </div>
    )
  }

  return (
    <div className="user-posts">
      <h3 style={{ color: theme?.cardText || '#2c3e50' }}>Publicaciones recientes</h3>
      <div className="posts-grid">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="post-card"
            style={{ 
              background: theme?.cardBG || 'white',
              color: theme?.cardText || '#495057'
            }}
          >
            <div className="post-header">
              <div className="post-type">
                <span className="type-icon">{getEventTypeIcon(post.tipo)}</span>
                <span className="type-label">{post.tipo}</span>
              </div>
              <div className="post-privacy">
                <span className="privacy-icon">{getPrivacyIcon(post.privacidad)}</span>
              </div>
            </div>
            
            <div className="post-content">
              <p className="post-text">{post.texto}</p>
              {post.fecha_evento && (
                               <div 
                 className="post-event-date"
                 style={{ borderLeftColor: theme?.btnPrimaryBG || '#667eea' }}
               >
                 <i 
                   className="bi bi-calendar-event"
                   style={{ color: theme?.btnPrimaryBG || '#667eea' }}
                 ></i>
                 <span>{formatDate(post.fecha_evento)}</span>
               </div>
              )}
            </div>
            
            <div className="post-footer">
              <div className="post-stats">
                                 <span className="stat">
                   <i 
                     className="bi bi-heart"
                     style={{ color: theme?.btnPrimaryBG || '#667eea' }}
                   ></i>
                   {post.likes}
                 </span>
                 <span className="stat">
                   <i 
                     className="bi bi-chat"
                     style={{ color: theme?.btnPrimaryBG || '#667eea' }}
                   ></i>
                   {post.comentarios?.length || 0}
                 </span>
              </div>
              <div className="post-date">
                {formatDate(post.fecha_creacion)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {posts.length >= maxPosts && (
        <div className="view-more">
          <button className="btn btn-outline-primary">
            Ver todas las publicaciones
          </button>
        </div>
      )}
    </div>
  )
}

export default UserPosts
