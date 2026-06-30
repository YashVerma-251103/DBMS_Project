export interface User {
  id: number;
  name: string;
  contactNumber: string;
  aaddhaar_no: string;
  role: string;
  password: string;
  loginId: string;
}

export interface Flight {
  flight_number: string;
  airline: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  gate: string;
  terminal: string;
}

export interface Booking {
  booking_id: number;
  facility_id: number;
  aadhaar_no: string;
  employee_id: number;
  date_time: string;
  payment_status: string;
}

export interface Employee {
  employee_id: number;
  name: string;
  role: string;
  shift_timings: string;
}

export interface Facility {
  facility_id: number;
  name: string;
  type: string;
  location: string;
  contact_no: string;
  opening_hours: string;
  manager_id: number;
}

export interface Incident {
  incident_id: number;
  facility_id: number;
  reported_by: number;
  description: string;
  status: string;
  reported_at: string;
  resolved_at: string | null;
}

export interface Feedback {
  feedback_id: number;
  facility_id: number;
  aadhaar_no: string;
  manager_id: number;
  date_time: string;
  rating: number;
  comments: string;
}

export interface StaffSchedule {
  schedule_id: number;
  employee_id: number;
  facility_id: number;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  task_description: string;
  created_at: string;
}

export interface Revenue {
  facility_id: number;
  facility_name: string;
  avg_revenue?: number;
  total_revenue?: number;
  financial_year: number;
}
