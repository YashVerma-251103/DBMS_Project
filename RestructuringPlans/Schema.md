> **Status: mostly implemented, differently shaped.** The staff hierarchy below (Management
> > Department > Role, with nested categories) made it in as data, not structure — it's a
> flat `Employee.Role` CHECK-list (22 values) plus one `Employee.Department` column, not a
> nested table hierarchy (see Implementation.md decision #3). Private jets/owner-flights,
> fuel/food/cargo/crew-assignment tracking, and Communication as a user-facing feature were
> never built — Flight is public/commercial only. See `database/migrations/0001_baseline.sql`
> for the actual current schema and `users/` for what each role can do with it.

# Navigation system:
## Inside Airport
- To stores, lounges, boarding gatesm counters, terminals
## Outside Airport
- To and from airport

# Flights
## Public /commercial airlines
- Status for particular flight
- dashboard for all fligths
- Booking on-spot and futreu flights
- plan travels
## Private Plans/Flights
- owner of jet
## Common to both
- hanger assigned
- crew assigned/travelling
- cargo
- passengers
- flight plan
- Fuel
- Food

# Incidents reporting
- reporter
- handled by complaint assignment engine

# Lounge and Shops
## Lounge
- reservations
- services searching engine
- timings
- benefits
## SHops
- Details
    - Inventory
    - shop id / number
    - staff
    - manager

# Admin & Staff
## Admin
- predefined user
- unrivaled authority over everything
## Staff:
### Hierarchy
- Management
    - (Airport and Airline Staff)
        - Counter Staff
        - Checkin and Boarding Staff
        - cargo moving staff
        - Flight Crew
            - Pilot
            - Air Hostess/stewards
    - (Finanace and Accounts)
    - (ATC Staff)
        - Air traffic Control Employees
        - Runway management
        - Hanger Management
        - Planes and Flights management
    - military
        - air marshall
        - runway patrol
    - (general staff)
        - security
        - store staff
        - hygiene staff
        - lounge staff & Airline Cook