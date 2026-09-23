import api from './axios';

export const signup = (data) => {
  return api.post('/users', data);   // lowercase 'post'
};

export const login = (email, password) => {
  return api.get('/users', { params: { email, password } });   
}      



// services/admissionService.js


// ============================================
// GET - Get all admissions
// ============================================
export const getAllAdmissions = () => {
  return api.get('/admission');
};



// ============================================
// POST - Create new admission
// ============================================
export const createAdmission = (data) => {
  return api.post('/admission', data);
};

// ============================================
// PUT - Update admission by Student ID
// ============================================
export const updateAdmissionByStudentId = (studentId, data) => {
  return api.put('/admission', data, { params: { studentId } });
};

export const deleteAdmissionByStudentId = (studentId) => {
  return api.delete('/admission', { params: { studentId } });
};



export const setSeatConfig = (data) => {
  // data = { className, shift, totalSeats }
  return api.post('/seats', data);
};

// GET ALL seats (filled + remaining ke sath)
export const getSeatAvailability = () => {
  return api.get('/seats');
};

// UPDATE SINGLE seat config by id
export const updateSeatConfig = (data, id) => {
  return api.put(`/seats?id=${id}`, data);
};

export const deleteSeatConfig = (id) => {
  return api.delete(`/seats?id=${id}`);
};



// ✅ Sahi - slash add karein
export const getadmissionbyid = (studentId) => {
  return api.get(`/getAdmById?studentId=${studentId}`);
};




export const sendNotification = (data) =>
  api.post("/notification", data);

// Get all notifications
export const getAllNotifications = () =>
  api.get("/notification");

// Delete notification by id
export const deleteNotification = (id) =>
  api.delete(`/notification?id=${id}`);


export const getapprovedstudents=()=>{
  return api.get("/getapprovedstd")
}

// Admission Settings — Get all (optional className / academicYear filter)
export const getAdmissionSettings = (params = {}) => {
  return api.get("/datesinfo", { params });
};

// Admission Settings — Get single by id
export const getAdmissionSettingById = (id) => {
  return api.get("/datesinfo", { params: { id } });
};

// Admission Settings — Create
export const createAdmissionSetting = (data) => {
  return api.post("/datesinfo", data);
};

// Admission Settings — Update by id
export const updateAdmissionSetting = (id, data) => {
  return api.put("/datesinfo", data, { params: { id } });
};

// Admission Settings — Delete by id
export const deleteAdmissionSetting = (id) => {
  return api.delete("/datesinfo", { params: { id } });
};