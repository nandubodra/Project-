const key = 'sahayak-applications';
export const getApplications = () => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
export const saveApplications = apps => localStorage.setItem(key, JSON.stringify(apps));
export const createApplication = data => {
  const application = { ...data, id: `SAH${Date.now().toString().slice(-8)}`, status: 'P', stage: 0, created_at: new Date().toISOString(), history: [{ stage: 0, status: 'P', by: data.applicant_name, at: new Date().toISOString(), note: '' }] };
  const apps = getApplications(); saveApplications([application, ...apps]); return application;
};
