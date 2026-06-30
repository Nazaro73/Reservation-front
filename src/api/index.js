import api from './client';

// Regroupe tous les appels à l'API admin, par domaine.

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data)
};

export const organizationApi = {
  get: () => api.get('/organization').then((r) => r.data.organization),
  update: (payload) => api.put('/organization', payload).then((r) => r.data.organization),
  regenerateApiKey: () => api.post('/organization/regenerate-api-key').then((r) => r.data),
  getSchedules: () => api.get('/organization/schedules').then((r) => r.data),
  setSchedules: (schedules) => api.post('/organization/schedules', { schedules }).then((r) => r.data),
  getTimeOffs: () => api.get('/organization/timeoffs').then((r) => r.data),
  addTimeOff: (payload) => api.post('/organization/timeoffs', payload).then((r) => r.data),
  deleteTimeOff: (id) => api.delete(`/organization/timeoffs/${id}`).then((r) => r.data)
};

export const staffApi = {
  list: () => api.get('/staff').then((r) => r.data),
  create: (payload) => api.post('/staff', payload).then((r) => r.data),
  get: (id) => api.get(`/staff/${id}`).then((r) => r.data),
  getSchedules: (id) => api.get(`/staff/${id}/schedules`).then((r) => r.data),
  setSchedules: (id, schedules) => api.post(`/staff/${id}/schedules`, { schedules }).then((r) => r.data),
  getTimeOffs: (id) => api.get(`/staff/${id}/timeoffs`).then((r) => r.data),
  addTimeOff: (id, payload) => api.post(`/staff/${id}/timeoffs`, payload).then((r) => r.data),
  deleteTimeOff: (id, timeoffId) => api.delete(`/staff/${id}/timeoffs/${timeoffId}`).then((r) => r.data)
};

export const serviceApi = {
  list: () => api.get('/services').then((r) => r.data),
  create: (payload) => api.post('/services', payload).then((r) => r.data),
  get: (id) => api.get(`/services/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/services/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/services/${id}`).then((r) => r.data),
  assign: (id, staffIds) => api.post(`/services/${id}/assign`, { staffIds }).then((r) => r.data),
  staffServices: (staffId) => api.get(`/services/staff/${staffId}`).then((r) => r.data)
};

export const bookingApi = {
  availableSlots: (staffId, params) =>
    api.get(`/bookings/staff/${staffId}/available-slots`, { params }).then((r) => r.data),
  create: (payload) => api.post('/bookings', payload).then((r) => r.data),
  list: (params) => api.get('/bookings', { params }).then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  cancel: (id) => api.post(`/bookings/${id}/cancel`).then((r) => r.data),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }).then((r) => r.data)
};

export const paymentApi = {
  create: (bookingId) => api.post('/payments', { bookingId }).then((r) => r.data),
  getStatus: (id) => api.get(`/payments/${id}`).then((r) => r.data)
};

export const googleApi = {
  getAuthUrl: (staffId) => api.get(`/google/connect/${staffId}`).then((r) => r.data),
  connectionStatus: (staffId) => api.get(`/google/connection/${staffId}`).then((r) => r.data),
  disconnect: (staffId) => api.delete(`/google/connection/${staffId}`).then((r) => r.data)
};
