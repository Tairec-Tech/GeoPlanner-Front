// Configuración de la API
const API_BASE_URL = 'http://localhost:8000'

// Tipos para las respuestas de la API
export interface User {
  id: string
  nombre_usuario: string
  email: string
  nombre: string
  apellido: string
  fecha_nacimiento?: string
  genero?: string
  biografia?: string
  latitud?: number
  longitud?: number
  ciudad?: string
  pais?: string
  tema_preferido?: string
  foto_perfil_url?: string
}

export interface Post {
  id: string
  id_autor: string
  nombre_autor: string
  username_autor: string
  foto_autor?: string
  texto: string
  tipo: string
  fecha_evento: string
  privacidad: string
  media_url?: string
  terminos_adicionales?: string
  estado: string
  fecha_creacion: string
  rutas?: Array<{
    coords: string
    label: string
  }>
  likes: number
  likers: string[]
  comentarios?: Array<{
    id: string
    id_autor: string
    nombre_autor: string
    username_autor: string
    foto_autor?: string
    texto: string
    fecha_creacion: string
    id_comentario_padre?: string
    respuestas: Array<{
      id: string
      id_autor: string
      nombre_autor: string
      username_autor: string
      foto_autor?: string
      texto: string
      fecha_creacion: string
      id_comentario_padre: string
      respuestas: any[]
      menciones: string[]
    }>
    menciones: string[]
  }>
  inscritos?: Array<{
    id_usuario: string
    nombre: string
  }>
  verificado?: boolean
}

export interface Notification {
  id: string
  id_usuario_destino: string
  id_usuario_origen: string
  id_publicacion: string
  id_comentario: string
  tipo: string
  mensaje: string
  leida: boolean
  fecha_creacion: string
  nombre_usuario_origen: string
  username_usuario_origen: string
}

export interface AgendaItem {
  id: string
  id_usuario: string
  titulo: string
  descripcion?: string
  fecha_actividad: string
  fecha_creacion: string
}

export interface LoginRequest {
  username_or_email: string
  password: string
}

export interface RegisterRequest {
  nombre_usuario: string
  email: string
  password: string
  nombre: string
  apellido: string
  fecha_nacimiento: string
  genero?: string
  biografia?: string
  latitud?: number
  longitud?: number
  ciudad?: string
  pais?: string
  tema_preferido?: string
  foto_perfil_url?: string
}

export interface PostCreateRequest {
  texto: string
  tipo: string
  fecha_evento: string
  privacidad?: string
  media_url?: string
  terminos_adicionales?: string
  rutas?: Array<{
    coords: string
    label: string
  }>
  terms?: {
    geoplanner: string
    additional: string
  }
}

export interface AgendaCreateRequest {
  titulo: string
  descripcion?: string
  fecha_actividad: string
}

export interface SavedEvent {
  id_usuario: string
  id_publicacion: string
  fecha_guardado: string
  publicacion?: Post
}

// Clase para manejar las llamadas a la API
class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('authToken')
  }

  // Método para establecer el token de autenticación
  setToken(token: string) {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  // Método para limpiar el token
  clearToken() {
    this.token = null
    localStorage.removeItem('authToken')
  }

  // Método genérico para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<{ access_token: string; token_type: string; user: User }> {
    const formData = new FormData()
    formData.append('username', credentials.username_or_email) // El backend espera 'username'
    formData.append('password', credentials.password)

    const response = await fetch(`${this.baseURL}/auth/token`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Login failed')
    }

    const tokenData = await response.json()
    this.setToken(tokenData.access_token)
    
    // Ahora obtener la información del usuario usando el token
    const userData = await this.getCurrentUser()
    
    return {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      user: userData
    }
  }

  async register(userData: RegisterRequest): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me')
  }

  // Métodos de publicaciones
  async getPosts(skip: number = 0, limit: number = 100): Promise<Post[]> {
    return this.request<Post[]>(`/posts/?skip=${skip}&limit=${limit}`)
  }

  async getPost(postId: string): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`)
  }

  async createPost(postData: PostCreateRequest): Promise<Post> {
    return this.request<Post>('/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  }

  async updatePost(postId: string, postData: Partial<PostCreateRequest>): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    })
  }

  async deletePost(postId: string): Promise<void> {
    return this.request<void>(`/posts/${postId}`, {
      method: 'DELETE',
    })
  }

  // Métodos de agenda
  async getAgenda(): Promise<AgendaItem[]> {
    return this.request<AgendaItem[]>('/agenda/')
  }

  async getAgendaItem(itemId: string): Promise<AgendaItem> {
    return this.request<AgendaItem>(`/agenda/${itemId}`)
  }

  async createAgendaItem(itemData: AgendaCreateRequest): Promise<AgendaItem> {
    return this.request<AgendaItem>('/agenda/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
  }

  async updateAgendaItem(itemId: string, itemData: Partial<AgendaCreateRequest>): Promise<AgendaItem> {
    return this.request<AgendaItem>(`/agenda/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    })
  }

  async deleteAgendaItem(itemId: string): Promise<void> {
    return this.request<void>(`/agenda/${itemId}`, {
      method: 'DELETE',
    })
  }

  // Métodos de eventos guardados
  async getSavedEvents(): Promise<SavedEvent[]> {
    return this.request<SavedEvent[]>('/saved-events/')
  }

  async saveEvent(publicationId: string): Promise<SavedEvent> {
    return this.request<SavedEvent>('/saved-events/', {
      method: 'POST',
      body: JSON.stringify({ id_publicacion: publicationId }),
    })
  }

  async unsaveEvent(publicationId: string): Promise<void> {
    return this.request<void>(`/saved-events/${publicationId}`, {
      method: 'DELETE',
    })
  }

  async getSavedEventsWithDetails(): Promise<SavedEvent[]> {
    return this.request<SavedEvent[]>('/saved-events/with-details')
  }

  // Métodos de usuarios
  async getUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    return this.request<User[]>(`/users/?skip=${skip}&limit=${limit}`)
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`)
  }

  async updateUser(userId: string, userData: Partial<RegisterRequest>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Método para actualizar el perfil del usuario actual
  async updateCurrentUserProfile(userData: {
    biografia?: string
    latitud?: number
    longitud?: number
    ciudad?: string
    pais?: string
    tema_preferido?: string
  }): Promise<{ mensaje: string; usuario: User }> {
    return this.request<{ mensaje: string; usuario: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Funciones para likes
  async likePost(postId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>(`/posts/${postId}/like`, {
      method: 'POST',
    })
  }

  async unlikePost(postId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>(`/posts/${postId}/unlike`, {
      method: 'DELETE',
    })
  }

  async getPostLikes(postId: string): Promise<{ id_publicacion: string; total_likes: number; usuarios_que_dieron_like: string[] }> {
    return this.request<{ id_publicacion: string; total_likes: number; usuarios_que_dieron_like: string[] }>(`/posts/${postId}/likes`)
  }

  // Funciones para comentarios
  async addComment(postId: string, texto: string, idComentarioPadre?: string): Promise<{ id: string; id_publicacion: string; id_autor: string; nombre_autor: string; username_autor: string; texto: string; fecha_creacion: string; id_comentario_padre?: string; respuestas: any[]; menciones: string[] }> {
    return this.request<{ id: string; id_publicacion: string; id_autor: string; nombre_autor: string; username_autor: string; texto: string; fecha_creacion: string; id_comentario_padre?: string; respuestas: any[]; menciones: string[] }>(`/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ texto, id_comentario_padre: idComentarioPadre }),
    })
  }

  async deleteComment(commentId: string, authorId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>(`/comments/${commentId}?author_id=${authorId}`, {
      method: 'DELETE',
    })
  }

  async getPostComments(postId: string): Promise<Array<{ id: string; id_publicacion: string; id_autor: string; nombre_autor: string; username_autor: string; texto: string; fecha_creacion: string; id_comentario_padre?: string; respuestas: any[]; menciones: string[] }>> {
    return this.request<Array<{ id: string; id_publicacion: string; id_autor: string; nombre_autor: string; username_autor: string; texto: string; fecha_creacion: string; id_comentario_padre?: string; respuestas: any[]; menciones: string[] }>>(`/comments/post/${postId}`)
  }

  // Funciones para notificaciones
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications/')
  }

  async markNotificationAsRead(notificationId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  async markAllNotificationsAsRead(): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/notifications/read-all', {
      method: 'PUT',
    })
  }

  async getUnreadNotificationsCount(): Promise<{ unread_count: number }> {
    return this.request<{ unread_count: number }>('/notifications/unread-count')
  }

  // Métodos para subir fotos de perfil
  async uploadProfilePhoto(file: File): Promise<{ mensaje: string; foto_perfil_url: string; usuario: User }> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request<{ mensaje: string; foto_perfil_url: string; usuario: User }>('/upload/profile-photo', {
      method: 'POST',
      body: formData,
      headers: {
        // No incluir Content-Type, dejar que el navegador lo establezca para FormData
      }
    })
  }

  async deleteProfilePhoto(): Promise<{ mensaje: string; usuario: User }> {
    return this.request<{ mensaje: string; usuario: User }>('/upload/profile-photo', {
      method: 'DELETE',
    })
  }

  // Método para verificar si el servidor está funcionando
  async healthCheck(): Promise<{ mensaje: string; version: string; estado: string }> {
    return this.request<{ mensaje: string; version: string; estado: string }>('/')
  }
}

// Exportar una instancia única del servicio
export const apiService = new ApiService()
