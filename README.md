# Airport Management System (AMS)

A full-stack web application for managing airport facilities, staff, bookings, flights, revenue, incidents, and feedback. Built with TypeScript across the entire stack.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, React Router v7, react-icons |
| Backend | Node.js, Express 4, TypeScript, ts-node-dev |
| Database | PostgreSQL 15 (hosted on Supabase) |
| DB Driver | node-postgres (`pg`) with SSL |

---

## User Flow

```mermaid
flowchart TD
    Start([User opens browser]) --> LP[LoginSignUp Page /]
    LP --> TabChoice{Choose tab}

    TabChoice -->|Sign Up| SU[Fill form\nname · contact · aadhaar · role · password]
    SU --> GenID["Login ID auto-generated\n{contactNumber}_{role}"]
    GenID --> PostUsers[POST /users]
    PostUsers --> ShowID[Login ID displayed to user]
    ShowID --> LP

    TabChoice -->|Login| LF[Enter Login ID + Password]
    LF --> GetUser[GET /users?loginId=...]
    GetUser --> Auth{Password matches?}
    Auth -->|No| Err[Invalid credentials]
    Err --> LF
    Auth -->|Yes| Store[Save user to localStorage]
    Store --> RoleCheck{Role in loginId?}

    RoleCheck -->|admin| AD[/AdminHome]
    RoleCheck -->|manager| MG[/ManagerHome]
    RoleCheck -->|employee| EM[/EmployeeHome]
    RoleCheck -->|customer| CU[/CustomerHome]

    AD --> ATabs["8 Tabs — Full CRUD\nFlights · Facility · Bookings · Incidents\nFeedback · Revenue · Employee · Staff Schedule"]
    MG --> MTabs["7 Tabs — View + Limited Edit\nFacility · Employees · Bookings\nFeedback · Revenue · Staff Schedule"]
    EM --> ETabs["3 Tabs — Mostly Read-Only\nProfile (edit own) · Facility · Bookings"]
    CU --> CTabs["3 Tabs\nFacilities (view) · Bookings (own CRUD) · Profile (edit own)"]

    ATabs -->|Logout| LP
    MTabs -->|Logout| LP
    ETabs -->|Logout| LP
    CTabs -->|Logout| LP
```

---

## System Architecture

```mermaid
graph TB
    subgraph Browser["Browser — localhost:3000"]
        direction TB
        React["React 19 + TypeScript\nCreate React App"]
        Router["React Router v7"]
        LS["localStorage\ncurrentUser"]

        subgraph UI["Pages"]
            direction LR
            P1["LoginSignUp"]
            P2["AdminHome\n8 tabs"]
            P3["ManagerHome\n7 tabs"]
            P4["EmployeeHome\n3 tabs"]
            P5["CustomerHome\n3 tabs"]
            P6["SearchFlights\nPublic"]
        end
    end

    subgraph API["Express Server — localhost:5000"]
        direction TB
        MW["CORS · express.json()"]
        subgraph Routes["REST Routes"]
            direction LR
            R1["/users"]
            R2["/flights"]
            R3["/bookings"]
            R4["/employees"]
            R5["/facilities"]
            R6["/incidents"]
            R7["/feedback"]
            R8["/revenue"]
            R9["/staff_schedule"]
        end
    end

    subgraph Supabase["Supabase — PostgreSQL 15"]
        direction TB
        Pool["pg.Pool + SSL"]
        subgraph Tables["11 Tables"]
            direction LR
            T1["users"]
            T2["Employee"]
            T3["Facility"]
            T4["Customer"]
            T5["Booking"]
            T6["Feedback"]
            T7["Revenue"]
            T8["Inventory"]
            T9["Flight"]
            T10["Staff_Schedule"]
            T11["Communication"]
            T12["Incident"]
        end
        Trigger["Trigger: check_manager_role\nBEFORE INSERT/UPDATE on Facility"]
    end

    Browser -->|"HTTP REST\nlocalhost:5000"| API
    API -->|"pg Pool\nSSL · port 5432"| Supabase
```

---

## Database Schema — Entity Relationships

```mermaid
erDiagram
    Employee {
        int Employee_Id PK
        varchar Name
        varchar Role
        varchar Shift_Timings
    }
    Facility {
        int Facility_Id PK
        varchar Name
        varchar Type
        text Location
        varchar Contact_No
        varchar Opening_Hours
        int Manager_Id FK
    }
    Customer {
        varchar Aadhaar_No PK
        varchar Customer_Name
        int Age
        varchar Contact_No
    }
    Booking {
        int Booking_Id
        int Facility_Id FK
        varchar Aadhaar_No FK
        int Employee_Id FK
        timestamp Date_Time
        varchar Payment_Status
    }
    Feedback {
        int Feedback_Id
        int Facility_Id FK
        varchar Aadhaar_No FK
        int Manager_Id FK
        timestamp Date_Time
        int Rating
        text Comments
    }
    Revenue {
        int Revenue_Id PK
        int Facility_Id FK
        int Financial_Year
        date Month
        numeric Monthly_Revenue
        numeric Yearly_Revenue
    }
    Inventory {
        int Inventory_Id PK
        int Facility_Id FK
        varchar Item_Name
        int Quantity
        varchar Supplier
    }
    Flight {
        int Flight_Id PK
        varchar Flight_Number
        varchar Airline
        timestamp Departure_Time
        timestamp Arrival_Time
        varchar Status
        varchar Gate
        varchar Terminal
    }
    Staff_Schedule {
        int Schedule_Id PK
        int Employee_Id FK
        int Facility_Id FK
        date Shift_Date
        time Shift_Start
        time Shift_End
        text Task_Description
    }
    Communication {
        int Message_Id PK
        int Sender_Id FK
        int Receiver_Id FK
        varchar Message_Type
        text Message
        timestamp Sent_At
    }
    Incident {
        int Incident_Id PK
        int Reported_By FK
        int Facility_Id FK
        text Description
        varchar Status
        timestamp Reported_At
        timestamp Resolved_At
    }
    users {
        int id PK
        varchar name
        varchar contact_number
        varchar aaddhaar_no
        varchar role
        varchar password
        varchar login_id
    }

    Employee ||--o{ Facility : "manages"
    Employee ||--o{ Booking : "handles"
    Employee ||--o{ Feedback : "manages"
    Employee ||--o{ Staff_Schedule : "scheduled in"
    Employee ||--o{ Communication : "sends"
    Employee ||--o{ Communication : "receives"
    Employee ||--o{ Incident : "reports"
    Facility ||--o{ Booking : "has"
    Facility ||--o{ Feedback : "receives"
    Facility ||--o{ Revenue : "generates"
    Facility ||--o{ Inventory : "holds"
    Facility ||--o{ Staff_Schedule : "hosts"
    Facility ||--o{ Incident : "site of"
    Customer ||--o{ Booking : "makes"
    Customer ||--o{ Feedback : "gives"
```

---

## Project Structure

```
DBMS_Project/
├── .env                        # DATABASE_URL (not committed)
├── backend/
│   ├── src/
│   │   ├── db.ts               # pg Pool with SSL → Supabase
│   │   ├── index.ts            # Express app (port 5000)
│   │   └── routes/
│   │       ├── users.ts
│   │       ├── flights.ts
│   │       ├── bookings.ts
│   │       ├── employees.ts
│   │       ├── facilities.ts
│   │       ├── incidents.ts
│   │       ├── feedback.ts
│   │       ├── staffSchedule.ts
│   │       └── revenue.ts
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── styles/ds.ts        # Shared inline style system + useIsMobile
│       ├── index.css           # Global utility classes
│       ├── components/
│       │   ├── LoginSignUp.tsx
│       │   ├── AdminHome.tsx
│       │   ├── ManagerHome.tsx
│       │   ├── EmployeeHome.tsx
│       │   ├── CustomerHome.tsx
│       │   ├── admin_tab/      # 8 tabs
│       │   └── customer_tab/   # 3 tabs
│       └── pages/
│           ├── Home.tsx
│           └── SearchFlights.tsx
└── database/
    ├── DDL_schema.sql
    ├── Triggers.sql
    ├── users.sql
    ├── Populate_tables.sql
    └── seed_users.sql
```

---

## Setup

### Prerequisites
- Node.js 18+
- A Supabase project (or local PostgreSQL)

### 1. Environment
Create `.env` in project root:
```env
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
PORT=5000
```

### 2. Database
Run in Supabase SQL Editor in order:
```
database/DDL_schema.sql
database/Triggers.sql
database/users.sql
database/Populate_tables.sql
database/seed_users.sql
```

### 3. Backend
```bash
cd backend && npm install && npm run dev
```

### 4. Frontend
```bash
cd frontend && npm install && npm start
```

---

## Test Credentials

| Role | Login ID | Password |
|---|---|---|
| Admin | `9000000001_admin` | `admin123` |
| Manager | `9000000002_manager` | `manager123` |
| Employee | `9000000003_employee` | `employee123` |
| Customer | `9000000004_customer` | `customer123` |

> **Note:** If on a university/college network, switch to mobile hotspot — port 5432 is commonly blocked on institutional networks.

---

## API Endpoints

Base URL: `http://localhost:5000`. All mutation params passed as URL query strings.

### `/users`
| Method | Path | Description |
|---|---|---|
| GET | `/users?loginId=` | Fetch user by login ID |
| POST | `/users` | Register new user |

### `/flights`
| Method | Path | Description |
|---|---|---|
| GET | `/flights/search` | Search by flight_number, airline, departure_date |
| POST | `/flights/create` | Create flight |
| PUT | `/flights/update` | Update flight |
| DELETE | `/flights/:flight_number` | Delete flight |

### `/bookings`
| Method | Path | Description |
|---|---|---|
| GET | `/bookings/search` | Search by booking_id, facility_id, aadhaar_no, payment_status |
| GET | `/bookings/summary` | Joined view with facility + customer + employee names |
| POST | `/bookings/create` | Create booking |
| PUT | `/bookings/update` | Admin update |
| PUT | `/bookings/status` | Update payment status only |
| DELETE | `/bookings/delete` | Delete booking |

### `/employees`
| Method | Path | Description |
|---|---|---|
| GET | `/employees/search` | Search by id, name, role, shift_timings |
| GET | `/employees/multiple-bookings` | Employees with 2+ bookings last month |
| POST | `/employees/insert` | Create employee |
| PUT | `/employees/update` | Update employee |
| DELETE | `/employees/delete` | Delete employee |

### `/facilities`
| Method | Path | Description |
|---|---|---|
| GET | `/facilities/search` | Search by id, name, type, location, manager_id |
| GET | `/facilities/top-rated` | Facilities with avg rating > 4 |
| POST | `/facilities/insert` | Create facility |
| PUT | `/facilities/update` | Update facility |
| DELETE | `/facilities/delete` | Delete facility |

### `/incidents`
| Method | Path | Description |
|---|---|---|
| GET | `/incidents/search` | Search by id, facility_id, reported_by, status |
| POST | `/incidents/insert` | Report incident |
| PUT | `/incidents/update` | Update incident |
| DELETE | `/incidents/delete` | Delete by id |
| DELETE | `/incidents/resolved` | Delete all resolved incidents |

### `/feedback`
| Method | Path | Description |
|---|---|---|
| GET | `/feedback/search` | Search by id, facility_id, aadhaar_no, manager_id, rating |
| POST | `/feedback/insert` | Submit feedback |
| PUT | `/feedback/update` | Update feedback |
| DELETE | `/feedback/delete` | Delete feedback |

### `/staff_schedule`
| Method | Path | Description |
|---|---|---|
| GET | `/staff_schedule/search` | Search by schedule_id, employee_id, facility_id, shift_date |
| GET | `/staff_schedule/schedules/today` | Today's schedules with employee + communication join |
| POST | `/staff_schedule/insert` | Create schedule |
| PUT | `/staff_schedule/update` | Update schedule |
| DELETE | `/staff_schedule/delete` | Delete schedule |

### `/revenue`
| Method | Path | Description |
|---|---|---|
| GET | `/revenue/yearly/:year` | Total revenue per facility for year |
| GET | `/revenue/average/:year` | Avg monthly revenue per facility for year |
| GET | `/revenue/calculate_avg` | Dynamic aggregation with filters |

---

## Role-Based Access

| Role | Dashboard | Capabilities |
|---|---|---|
| Admin | `/AdminHome` | Full CRUD on all 8 entities |
| Manager | `/ManagerHome` | View + limited edit on facilities, employees, bookings, feedback, revenue, schedules |
| Employee | `/EmployeeHome` | Edit own profile; read-only access to facilities and bookings |
| Customer | `/CustomerHome` | Browse facilities; full CRUD on own bookings; edit own profile |

Authentication is client-side only (localStorage). Login ID contains the role string for routing.

---

## User Flow

```mermaid
flowchart TD
    Start([User opens app]) --> Login

    subgraph Auth["Authentication — /LoginSignup"]
        Login[Login Tab]
        Signup[Sign Up Tab]
        Login -->|Enter loginId + password| Verify["GET /users?loginId=..."]
        Verify -->|Password mismatch| Err[Invalid credentials alert]
        Err --> Login
        Signup -->|Fill name · contact · aadhaar · role · password| Register[POST /users]
        Register --> Generated["loginId = contact_role"]
        Generated --> Login
    end

    Verify -->|admin in loginId| Admin
    Verify -->|manager in loginId| Manager
    Verify -->|employee in loginId| Employee
    Verify -->|customer in loginId| Customer

    subgraph Admin["/AdminHome"]
        A1[Flights] & A2[Facility] & A3[Bookings] & A4[Incidents]
        A5[Feedback] & A6[Revenue] & A7[Employee] & A8[Staff Schedule]
    end

    subgraph Manager["/ManagerHome"]
        M1[Facility] & M2[Employees] & M3[Bookings]
        M4[Feedback] & M5[Revenue] & M6[Inventory] & M7[Staff Schedule]
    end

    subgraph Employee["/EmployeeHome"]
        E1[Profile] & E2[Facility] & E3[Bookings]
    end

    subgraph Customer["/CustomerHome"]
        C1[Facilities] & C2[Bookings] & C3[Profile]
    end

    Admin --> Logout([Logout])
    Manager --> Logout
    Employee --> Logout
    Customer --> Logout
    Logout --> Login
```

---

## System Architecture

```mermaid
graph TB
    subgraph Browser["Browser — localhost:3000"]
        direction TB
        UI["React 19 + TypeScript\nReact Router v7"]
        Pages["LoginSignUp · AdminHome · ManagerHome\nEmployeeHome · CustomerHome"]
        LS["localStorage: currentUser"]
        UI --> Pages
        Pages -.->|store on login| LS
    end

    subgraph API["Express Backend — localhost:5000"]
        direction TB
        MW["CORS · express.json()"]
        subgraph Routes["9 Route Groups"]
            direction LR
            RT1["/users"] & RT2["/flights"] & RT3["/bookings"]
            RT4["/employees"] & RT5["/facilities"] & RT6["/incidents"]
            RT7["/feedback"] & RT8["/staff_schedule"] & RT9["/revenue"]
        end
        Pool["node-postgres Pool · SSL"]
        MW --> Routes --> Pool
    end

    subgraph Supabase["Supabase PostgreSQL — Singapore"]
        direction TB
        subgraph CoreTables["Core"]
            T1["Employee"] & T2["Facility"] & T3["Customer"]
        end
        subgraph OpsTables["Operations"]
            T4["Booking"] & T5["Feedback"] & T6["Incident"]
            T7["Staff_Schedule"] & T8["Communication"]
        end
        subgraph DataTables["Data"]
            T9["Flight"] & T10["Revenue"] & T11["Inventory"]
        end
        AuthT["users"]
        Trigger["Trigger: check_manager_role"]
        T2 -->|Manager_Id FK| T1
        T4 -->|FK| T2 & T3 & T1
        T5 -->|FK| T2 & T3
        T6 & T7 -->|FK| T1 & T2
        T10 & T11 -->|FK| T2
        Trigger -.->|BEFORE INSERT/UPDATE| T2
    end

    Browser -->|"HTTP fetch() — GET/POST/PUT/DELETE"| API
    API -->|"SSL :5432"| Supabase
```
