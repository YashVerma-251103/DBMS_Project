export interface User {
  id: number;
  name: string;
  contactNumber: string;
  customerId?: number | null;
  employeeId?: number | null;
  role: string;
  loginId: string;
}

export interface Customer {
  customer_id: number;
  customer_name: string;
  age: number;
  sex?: string;
  nationality?: string;
  contact_no: string;
}

export interface Flight {
  flight_id: number;
  flight_number: string;
  airline: string;
  origin?: string;
  destination?: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  gate: string;
  terminal: string;
}

export interface Booking {
  booking_id: number;
  facility_id: number | null;
  flight_id: number | null;
  customer_id: number;
  employee_id: number | null;
  date_time: string;
  payment_status: string;
  checked_in: boolean;
}

export const EMPLOYEE_ROLES = [
  'Manager', 'Staff', 'Technician', 'Cleaner', 'Security', 'Authority',
  'Counter Staff', 'Checkin and Boarding Staff', 'Cargo Moving Staff', 'Pilot', 'Air Hostess/Steward',
  'Finance and Accounts Staff',
  'Air Traffic Control Employee', 'Runway Management', 'Hangar Management', 'Planes and Flights Management',
  'Air Marshal', 'Runway Patrol',
  'Store Staff', 'Hygiene Staff', 'Lounge Staff', 'Airline Cook',
];

export const DEPARTMENTS = [
  'Airport and Airline Staff', 'Finance and Accounts', 'ATC Staff', 'Military', 'General Staff',
];

export const DASHBOARD_PATH: Record<string, string> = {
  admin: '/AdminHome',
  manager: '/ManagerHome',
  employee: '/EmployeeHome',
  customer: '/',
};

export interface Employee {
  employee_id: number;
  name: string;
  role: string;
  department?: string;
  shift_timings: string;
}

export interface Facility {
  facility_id: number;
  name: string;
  type: string;
  location: string;
  description?: string;
  contact_no: string;
  opening_hours: string;
  manager_id: number;
}

export interface Incident {
  incident_id: number;
  facility_id: number;
  reported_by: number | null;
  reported_by_customer_id: number | null;
  assigned_to: number | null;
  description: string;
  status: string;
  reported_at: string;
  resolved_at: string | null;
}

export interface Feedback {
  feedback_id: number;
  facility_id: number;
  customer_id: number;
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

export interface Inventory {
  inventory_id: number;
  facility_id: number;
  item_name: string;
  quantity?: number;
  price?: number;
  supplier?: string;
  facility_name?: string;
  facility_location?: string;
  facility_contact?: string;
}

export interface Revenue {
  facility_id: number;
  facility_name: string;
  avg_revenue?: number;
  total_revenue?: number;
  financial_year: number;
}
