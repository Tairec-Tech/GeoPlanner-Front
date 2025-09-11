// Importar configuración centralizada
import { API_BASE_URL } from '../config/api';

// Interfaces para QR y asistencia
export interface QRCodeResponse {
  qr_code_data: string
  qr_image_base64: string
  inscription_id: string
}

export interface QRVerificationRequest {
  qr_data: string
  verificador_id: string
  ubicacion_lat?: number
  ubicacion_lng?: number
  notas?: string
}

export interface QRVerificationResponse {
  success: boolean
  message: string
  user_name?: string
  event_title?: string
  verification_id?: string
}

export interface HistorialAsistenciaResponse {
  id: string
  id_inscripcion_usuario: string
  id_inscripcion_publicacion: string
  id_verificador: string
  estado_verificacion: string
  fecha_verificacion: string
  ubicacion_verificacion_lat?: number
  ubicacion_verificacion_lng?: number
  notas_verificacion?: string
  nombre_usuario: string
  nombre_verificador: string
  titulo_evento: string
}

export interface EstadisticasAsistencia {
  total_inscritos: number
  total_asistieron: number
  total_no_asistieron: number
  porcentaje_asistencia: number
  estadisticas_genero: {
    masculino: number
    femenino: number
    otro: number
  }
  estadisticas_por_fecha: Array<{
    fecha: string
    inscritos: number
    asistieron: number
    porcentaje: number
  }>
  estadisticas_por_hora: Array<{
    hora: string
    cantidad: number
    porcentaje: number
  }>
}

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
  terms?: {
    geoplanner: string
    additional: string
  }
  estado: string
  fecha_creacion: string
  rutas?: Array<{
    latitud: number
    longitud: number
    etiqueta: string
    orden: number
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
    latitud: number
    longitud: number
    etiqueta: string
    orden: number
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

// Interfaz para la respuesta del backend
export interface SavedEventWithDetails {
  evento_guardado: {
    id_usuario: string
    id_publicacion: string
    fecha_guardado: string
  }
  publicacion: {
    id: string
    texto: string
    tipo: string
    fecha_evento: string
    estado: string
    id_autor: string
  }
}

// Interfaz para las configuraciones de usuario
export interface UserSettings {
  // Notificaciones
  emailNotifications: boolean
  pushNotifications: boolean
  newFriendRequests: boolean
  eventInvitations: boolean
  likesAndComments: boolean
  mentions: boolean
  nearbyEvents: boolean
  weeklyDigest: boolean
  
  // Privacidad
  profileVisibility: 'public' | 'friends' | 'private'
  showLocation: boolean
  showBirthDate: boolean
  allowFriendRequests: boolean
  allowMessages: boolean
  showOnlineStatus: boolean
  allowTagging: boolean
  
  // Seguridad
  twoFactorAuth: boolean
  loginAlerts: boolean
  deviceManagement: boolean
  
  // Contenido
  language: string
  timezone: string
  contentFilter: 'none' | 'moderate' | 'strict'
  autoPlayVideos: boolean
  showTrendingContent: boolean
  
  // Datos
  dataUsage: 'standard' | 'reduced'
  analyticsSharing: boolean
  personalizedAds: boolean
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
    const response = await this.request<SavedEventWithDetails[]>('/saved-events/with-details')
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    return response.map(item => ({
      id_usuario: item.evento_guardado.id_usuario,
      id_publicacion: item.evento_guardado.id_publicacion,
      fecha_guardado: item.evento_guardado.fecha_guardado,
      publicacion: {
        id: item.publicacion.id,
        id_autor: item.publicacion.id_autor,
        nombre_autor: '', // Se llenará desde los posts
        username_autor: '', // Se llenará desde los posts
        foto_autor: '', // Se llenará desde los posts
        texto: item.publicacion.texto,
        tipo: item.publicacion.tipo,
        fecha_evento: item.publicacion.fecha_evento,
        privacidad: 'publica', // Valor por defecto
        media_url: '', // Se llenará desde los posts
        terminos_adicionales: '', // Se llenará desde los posts
        estado: item.publicacion.estado,
        fecha_creacion: '', // Se llenará desde los posts
        rutas: [], // Se llenará desde los posts
        likes: 0, // Se llenará desde los posts
        likers: [], // Se llenará desde los posts
        comentarios: [], // Se llenará desde los posts
        inscritos: [], // Se llenará desde los posts
        verificado: false // Se llenará desde los posts
      }
    }))
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

  // Métodos para perfiles públicos
  async getUserById(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`)
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.request<Post[]>(`/users/${userId}/posts`)
  }

  async getFriendshipStatus(userId1: string, userId2: string): Promise<{
    status: 'none' | 'pending' | 'accepted' | 'blocked'
    isBlockedByMe: boolean
    isBlockedByThem: boolean
  }> {
    return this.request<{
      status: 'none' | 'pending' | 'accepted' | 'blocked'
      isBlockedByMe: boolean
      isBlockedByThem: boolean
    }>(`/friendship/status/${userId1}/${userId2}`)
  }

  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/friendship/request', {
      method: 'POST',
      body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
    })
  }

  async blockUser(blockerUserId: string, blockedUserId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/friendship/block', {
      method: 'POST',
      body: JSON.stringify({ blocker_user_id: blockerUserId, blocked_user_id: blockedUserId }),
    })
  }

  async unblockUser(blockerUserId: string, blockedUserId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/friendship/unblock', {
      method: 'POST',
      body: JSON.stringify({ blocker_user_id: blockerUserId, blocked_user_id: blockedUserId }),
    })
  }

  async cancelFriendRequest(fromUserId: string, toUserId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/friendship/request', {
      method: 'DELETE',
      body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
    })
  }

  async removeFriendship(fromUserId: string, toUserId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/friendship/friendship', {
      method: 'DELETE',
      body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
    })
  }

  async getUserFriends(userId: string): Promise<Array<{
    id: string
    nombre: string
    apellido: string
    nombre_usuario: string
    foto_perfil_url?: string
    verificado: boolean
    fecha_amistad: string
  }>> {
    return this.request<Array<{
      id: string
      nombre: string
      apellido: string
      nombre_usuario: string
      foto_perfil_url?: string
      verificado: boolean
      fecha_amistad: string
    }>>(`/friendship/friends/${userId}`)
  }

  // Obtener usuarios bloqueados por el usuario actual
  async getBlockedUsers(): Promise<any[]> {
    const response = await this.request<any[]>('/users/blocked')
    return response
  }

  // Métodos para QR y asistencia
  async generateQRCode(eventId: string, userId: string): Promise<QRCodeResponse> {
    return this.request<QRCodeResponse>(`/qr-attendance/generate-qr/${eventId}/${userId}`, {
      method: 'POST',
    })
  }

  async verifyQRCode(verificationData: QRVerificationRequest): Promise<QRVerificationResponse> {
    return this.request<QRVerificationResponse>('/qr-attendance/verify-qr', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    })
  }

  async getAttendanceHistory(eventId: string): Promise<HistorialAsistenciaResponse[]> {
    return this.request<HistorialAsistenciaResponse[]>(`/qr-attendance/historial/${eventId}`)
  }

  async getAttendanceStatistics(eventId: string): Promise<EstadisticasAsistencia> {
    return this.request<EstadisticasAsistencia>(`/qr-attendance/estadisticas/${eventId}`)
  }

  // Métodos para inscripción en eventos
  async inscribirseEvento(postId: string): Promise<{message: string, inscripcion_id: string}> {
    return this.request<{message: string, inscripcion_id: string}>(`/posts/${postId}/inscribirse`, {
      method: 'POST',
    })
  }

  async desinscribirseEvento(postId: string): Promise<{message: string}> {
    return this.request<{message: string}>(`/posts/${postId}/desinscribirse`, {
      method: 'DELETE',
    })
  }

  // Obtener inscripciones del usuario actual
  async getMyInscriptions(): Promise<Array<{
    id: string
    id_usuario: string
    id_publicacion: string
    fecha_inscripcion: string
    estado_asistencia: string
    publicacion: {
      id: string
      texto: string
      tipo: string
      privacidad: string
      fecha_evento: string
      autor: {
        id: string
        nombre: string
        apellido: string
        username: string
        foto_perfil: string
      }
    }
  }>> {
    return this.request<Array<{
      id: string
      id_usuario: string
      id_publicacion: string
      fecha_inscripcion: string
      estado_asistencia: string
      publicacion: {
        id: string
        texto: string
        tipo: string
        privacidad: string
        fecha_evento: string
        autor: {
          id: string
          nombre: string
          apellido: string
          username: string
          foto_perfil: string
        }
      }
    }>>('/posts/my-inscriptions')
  }

  // Métodos para solicitudes de amistad
  async sendFriendshipRequest(toUserId: string): Promise<{mensaje: string, amistad: any}> {
    return this.request<{mensaje: string, amistad: any}>('/friendship/request', {
      method: 'POST',
      body: JSON.stringify({
        to_user_id: toUserId
      }),
    })
  }

  async acceptFriendshipRequest(friendId: string, userId: string): Promise<{mensaje: string, amistad: any}> {
    return this.request<{mensaje: string, amistad: any}>(`/friendship/accept/${friendId}?user_id=${userId}`, {
      method: 'PUT',
    })
  }

  async rejectFriendshipRequest(friendId: string, userId: string): Promise<{mensaje: string}> {
    return this.request<{mensaje: string}>(`/friendship/reject/${friendId}?user_id=${userId}`, {
      method: 'PUT',
    })
  }

  // ===== MÉTODOS PARA CONFIGURACIONES DE USUARIO =====

  // Obtener configuraciones del usuario
  async getUserSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/users/settings')
  }

  // Actualizar configuraciones del usuario
  async updateUserSettings(settings: Partial<UserSettings>): Promise<{ mensaje: string; configuraciones: UserSettings }> {
    return this.request<{ mensaje: string; configuraciones: UserSettings }>('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      }),
    })
  }

  // Configurar autenticación de dos factores
  async setupTwoFactor(): Promise<{ 
    mensaje: string
    qr_code: string
    secret_key: string
    backup_codes: string[]
  }> {
    return this.request<{ 
      mensaje: string
      qr_code: string
      secret_key: string
      backup_codes: string[]
    }>('/users/setup-2fa', {
      method: 'POST',
    })
  }

  // Verificar código de autenticación de dos factores
  async verifyTwoFactorCode(code: string): Promise<{ mensaje: string; success: boolean }> {
    return this.request<{ mensaje: string; success: boolean }>('/users/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  // Desactivar autenticación de dos factores
  async disableTwoFactor(password: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/users/disable-2fa', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  // Obtener sesiones activas del usuario
  async getActiveSessions(): Promise<Array<{
    id: string
    device_info: string
    ip_address: string
    location: string
    last_activity: string
    is_current: boolean
  }>> {
    return this.request<Array<{
      id: string
      device_info: string
      ip_address: string
      location: string
      last_activity: string
      is_current: boolean
    }>>('/users/sessions')
  }

  // Cerrar sesión específica
  async revokeSession(sessionId: string): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>(`/users/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  }

  // Cerrar todas las sesiones excepto la actual
  async revokeAllOtherSessions(): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/users/sessions/revoke-others', {
      method: 'DELETE',
    })
  }

  // Descargar datos del usuario
  async downloadUserData(): Promise<{ mensaje: string; download_url: string; expires_at: string }> {
    return this.request<{ mensaje: string; download_url: string; expires_at: string }>('/users/download-data', {
      method: 'POST',
    })
  }

  // Eliminar cuenta del usuario
  async deleteAccount(reason: string, password: string, downloadData: boolean = true): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/users/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({
        reason,
        password,
        download_data: downloadData
      }),
    })
  }

  // Obtener historial de actividad del usuario
  async getUserActivityHistory(limit: number = 50): Promise<Array<{
    id: string
    action: string
    description: string
    ip_address: string
    user_agent: string
    timestamp: string
  }>> {
    return this.request<Array<{
      id: string
      action: string
      description: string
      ip_address: string
      user_agent: string
      timestamp: string
    }>>(`/users/activity-history?limit=${limit}`)
  }

  // Exportar configuraciones por defecto
  getDefaultSettings(): UserSettings {
    return {
      // Notificaciones
      emailNotifications: true,
      pushNotifications: true,
      newFriendRequests: true,
      eventInvitations: true,
      likesAndComments: true,
      mentions: true,
      nearbyEvents: false,
      weeklyDigest: true,
      
      // Privacidad
      profileVisibility: 'public',
      showLocation: true,
      showBirthDate: true,
      allowFriendRequests: true,
      allowMessages: true,
      showOnlineStatus: true,
      allowTagging: true,
      
      // Seguridad
      twoFactorAuth: false,
      loginAlerts: true,
      deviceManagement: true,
      
      // Contenido
      language: 'es',
      timezone: 'America/Caracas',
      contentFilter: 'moderate',
      autoPlayVideos: true,
      showTrendingContent: true,
      
      // Datos
      dataUsage: 'standard',
      analyticsSharing: true,
      personalizedAds: false
    }
  }

}

// Exportar una instancia única del servicio
export const apiService = new ApiService()
