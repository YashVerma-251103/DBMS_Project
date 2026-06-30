# Airport Management System (AMS)

A full-stack web application for managing airport facilities, staff, bookings, flights, revenue, incidents, and feedback. Built with TypeScript across the entire stack.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, React Router v6, Axios |
| Backend | Node.js, Express, TypeScript, ts-node-dev |
| Database | PostgreSQL |
| DB Driver | node-postgres (`pg`) |

---

## Project Structure

```
DBMS_Project/
├── .env                        # Database credentials (not committed)
├── backend/                    # Express/TypeScript API server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── db.ts               # PostgreSQL connection pool
│       ├── index.ts            # Express app entry point (port 5000)
│       └── routes/
│           ├── flights.ts
│           ├── bookings.ts
│           ├── employees.ts
│           ├── facilities.ts
│           ├── incidents.ts
│           ├── feedback.ts
│           ├── staffSchedule.ts
│           ├── revenue.ts
│           └── users.ts
├── frontend/                   # React/TypeScript SPA
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx             # Root router
│       ├── index.tsx           # React entry point
│       ├── api/index.ts        # Axios instance (baseURL: localhost:5000)
│       ├── types/index.ts      # Shared TypeScript interfaces
│       ├── components/
│       │   ├── LoginSignUp.tsx
│       │   ├── AdminHome.tsx
│       │   ├── ManagerHome.tsx
│       │   ├── EmployeeHome.tsx
│       │   ├── CustomerHome.tsx
│       │   ├── admin_tab/      # 8 admin management tabs
│       │   └── customer_tab/   # 3 customer-facing tabs
│       └── pages/
│           ├── Home.tsx
│           └── SearchFlights.tsx
└── database/
    ├── DDL_schema.sql          # Table definitions
    ├── Populate_tables.sql     # Sample data
    ├── users.sql               # Users table
    ├── Triggers.sql            # DB triggers
    └── Functional_querries.sql # Complex queries reference
```

---

## Database Schema

### Tables

| Table | Primary Key | Description |
|---|---|---|
| `Employee` | `Employee_Id` (SERIAL) | Staff with roles: Manager, Staff, Technician, Cleaner, Security, Authority |
| `Facility` | `Facility_Id` (SERIAL) | Airport facilities (Gym, Lounge, Restaurant, Shop, Other) linked to a manager |
| `Customer` | `Aadhaar_No` (VARCHAR) | Customers identified by Aadhaar number |
| `Booking` | `(Booking_Id, Facility_Id, Aadhaar_No)` | Customer bookings for facilities |
| `Feedback` | `(Feedback_Id, Facility_Id, Aadhaar_No, Manager_Id)` | Customer ratings (1–5) per facility |
| `Revenue` | `Revenue_Id` (SERIAL) | Monthly/yearly revenue per facility |
| `Inventory` | `Inventory_Id` (SERIAL) | Items per facility with quantity and supplier |
| `Flight` | `Flight_Id` (SERIAL) | Flight details with status tracking |
| `Staff_Schedule` | `Schedule_Id` (SERIAL) | Employee shift scheduling per facility |
| `Communication` | `Message_Id` (SERIAL) | Internal employee messaging (Alert, Notice, Message) |
| `Incident` | `Incident_Id` (SERIAL) | Operational incidents reported by staff |
| `users` | `id` (SERIAL) | Application login accounts |

### Key Relationships

- `Facility.Manager_Id` → `Employee.Employee_Id`
- `Booking.Facility_Id` → `Facility`, `Booking.Aadhaar_No` → `Customer`, `Booking.Employee_Id` → `Employee`
- `Feedback.Facility_Id` → `Facility`, `Feedback.Aadhaar_No` → `Customer`, `Feedback.Manager_Id` → `Employee`
- `Staff_Schedule.(Employee_Id, Facility_Id)` → `Employee`, `Facility`
- `Incident.(Reported_By, Facility_Id)` → `Employee`, `Facility`

---

## API Endpoints

All mutation endpoints (POST, PUT, DELETE) accept parameters as **URL query strings**.

### Flights — `/flights`
| Method | Path | Description |
|---|---|---|
| GET | `/flights/search` | Search by `flight_number`, `airline`, `departure_date` |
| POST | `/flights/create` | Create a new flight |
| PUT | `/flights/update` | Update flight fields dynamically |
| DELETE | `/flights/:flight_number` | Delete a flight |

### Bookings — `/bookings`
| Method | Path | Description |
|---|---|---|
| GET | `/bookings/search` | Search by `booking_id`, `facility_id`, `aadhaar_no`, `payment_status` |
| GET | `/bookings/summary` | Booking summary with facility JOIN |
| POST | `/bookings/create` | Create a booking |
| PUT | `/bookings/update` | Admin update (all fields) |
| PUT | `/bookings/update_customer` | Customer update (date_time, payment_status only) |
| PUT | `/bookings/status` | Update payment status only |
| DELETE | `/bookings/delete` | Admin delete |
| DELETE | `/bookings/delete_customer` | Customer delete own booking |

### Employees — `/employees`
| Method | Path | Description |
|---|---|---|
| GET | `/employees/search` | Search by `employee_id`, `name`, `role`, `shift_timings` |
| GET | `/employees/multiple-bookings` | Employees handling multiple bookings |
| POST | `/employees/insert` | Create employee |
| PUT | `/employees/update` | Update employee |
| DELETE | `/employees/delete` | Delete employee |

### Facilities — `/facilities`
| Method | Path | Description |
|---|---|---|
| GET | `/facilities/search` | Search by `facility_id`, `name`, `type`, `location`, `manager_id` |
| GET | `/facilities/top-rated` | Facilities with average rating > 4 |
| POST | `/facilities/insert` | Create facility |
| PUT | `/facilities/update` | Update facility |
| DELETE | `/facilities/delete` | Delete facility |

### Incidents — `/incidents`
| Method | Path | Description |
|---|---|---|
| GET | `/incidents/search` | Search by `incident_id`, `facility_id`, `reported_by`, `status` |
| POST | `/incidents/insert` | Report a new incident |
| PUT | `/incidents/update` | Update incident status/details |
| DELETE | `/incidents/resolved` | Delete all resolved incidents |
| DELETE | `/incidents/delete` | Delete by `incident_id` |

### Feedback — `/feedback`
| Method | Path | Description |
|---|---|---|
| GET | `/feedback/search` | Search by `feedback_id`, `facility_id`, `aadhaar_no`, `manager_id`, `rating` |
| POST | `/feedback/insert` | Submit feedback |
| PUT | `/feedback/update` | Update feedback |
| DELETE | `/feedback/delete` | Delete feedback |

### Staff Schedule — `/staff_schedule`
| Method | Path | Description |
|---|---|---|
| GET | `/staff_schedule/search` | Search by `schedule_id`, `employee_id`, `facility_id`, `shift_date` |
| GET | `/staff/schedules/today` | Today's schedules with employee and communication JOIN |
| POST | `/staff_schedule/insert` | Create schedule |
| PUT | `/staff_schedule/update` | Update schedule |
| DELETE | `/staff_schedule/delete` | Delete schedule |

### Revenue — `/revenue`
| Method | Path | Description |
|---|---|---|
| GET | `/revenue/yearly/:year` | Revenue records for a given year |
| GET | `/revenue/average/:year` | Average revenue per facility for a given year |
| GET | `/revenue/calculate_avg` | Dynamic aggregation (SUM or AVG) with optional `facility_id`, `start_date`, `end_date`, `aggregation`, `revenue_type` filters |

### Users — `/users`
| Method | Path | Description |
|---|---|---|
| GET | `/users?loginId=` | Look up user by login ID (returns array) |
| POST | `/users` | Register a new user (JSON body) |

---

## Role-Based Access

Login redirects based on the `loginId` string:

| loginId contains | Role | Dashboard |
|---|---|---|
| `admin` | Administrator | Full CRUD on all 8 entities |
| `manager` | Facility Manager | View/edit facilities, employees, bookings, feedback, schedules, revenue |
| `employee` | Staff | View own profile, assigned facility, bookings |
| `customer` | Customer | Browse facilities, manage own bookings, view profile |

User accounts are stored in the `users` table. The `role` field and `loginId` are set at signup.

---

## Setup & Running

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Database Setup

```sql
-- Create the database
CREATE DATABASE ams;

-- Connect to it, then run in order:
\i database/DDL_schema.sql
\i database/users.sql
\i database/Triggers.sql
\i database/Populate_tables.sql
```

### 2. Environment Variables

Create `.env` in the project root (already present):

```env
DB_HOST="localhost"
DB_PORT=5432
DB_NAME="ams"
DB_USER="postgres"
DB_PASS="your_password"
```

### 3. Backend

```bash
cd backend
npm install
npm run dev       # starts ts-node-dev on port 5000
```

For production:
```bash
npm run build     # compiles to dist/
npm start         # runs compiled JS
```

### 4. Frontend

```bash
cd frontend
npm install
npm start         # starts React dev server on port 3000
```

---

## Frontend Routes

| Path | Component | Access |
|---|---|---|
| `/` | `LoginSignUp` | Public |
| `/LoginSignup` | `LoginSignUp` | Public |
| `/home` | `Home` | Public |
| `/flights/search` | `SearchFlights` | Public |
| `/AdminHome` | `AdminHome` | Admin |
| `/ManagerHome` | `ManagerHome` | Manager |
| `/EmployeeHome` | `EmployeeHome` | Employee |
| `/CustomerHome` | `CustomerHome` | Customer |

---

## Authentication

Authentication is handled client-side. After a successful login, the user object is stored in `localStorage` under the key `currentUser`. Role-based routing reads the `loginId` field to determine which dashboard to navigate to. There is no JWT or session-based auth — this is a DBMS course project.

---

## Notes

- The backend uses parameterized queries (`$1, $2, ...`) via `node-postgres` to prevent SQL injection.
- Dynamic updates use `WHERE 1=1 AND ...` clause building so only provided fields are updated.
- The `staff_schedule` router is mounted on both `/staff_schedule` and `/staff` to support the `/staff/schedules/today` endpoint.
- The `database/wrong_queries.sql` file contains query drafts kept for reference only.
