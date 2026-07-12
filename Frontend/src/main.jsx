import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Box, CalendarDays,
  ChevronDown, MoreHorizontal, Moon, Search, Settings, ShieldCheck, Sun, ToolCase, Truck,
  Users, X, Zap, LockKeyhole, Mail, Eye, EyeOff, ArrowRight, CheckCircle2, LogOut, UserRound, SlidersHorizontal, Plus, FileText, MapPin, Pencil, Trash2,
  LayoutDashboard, CircleDollarSign, Menu
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./styles.css";
import client from "./api/client";

const nav = [
  [LayoutDashboard, "Dashboard"],
  [Truck, "Vehicles"],
  [Users, "Drivers"],
  [Box, "Trips"],
  [ToolCase, "Maintenance"],
  [CircleDollarSign, "Expenses"],
];

function Status({ children, color = "green" }) {
  return <span className={`status ${color}`}><i />{children}</span>;
}

function IconTile({ icon: Icon, color }) {
  return <div className={`icon-tile ${color}`}><Icon size={22} strokeWidth={2.3} /></div>;
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Kpi({ icon, color, value, label, change, down }) {
  return (
    <Card className="kpi">
      <IconTile icon={icon} color={color} />
      <div className="kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={down ? "negative" : "positive"}>
          {down ? <ArrowDownRight /> : <ArrowUpRight />}
          {change} <em>vs last week</em>
        </small>
      </div>
      <MoreHorizontal className="kpi-more" size={18} />
    </Card>
  );
}

function Sidebar({ open, setOpen, theme, setTheme, user, onLogout, page, setPage }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><Truck size={23} /></div>
        <span>Transit<span>Ops</span></span>
        <button className="mobile-close" onClick={() => setOpen(false)}><X /></button>
      </div>
      <div className="workspace">
        <div className="company-logo">N</div>
        <div>
          <b>Northstar Fleet</b>
          <small>{user?.role || 'Operations'}</small>
        </div>
        <ChevronDown size={16} />
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav>
        {nav.map(([Icon, text]) => (
          <button
            key={text}
            onClick={() => {
              setPage(text);
              setOpen(false);
            }}
            className={text === page ? "active" : ""}
          >
            <Icon size={19} />
            <span>{text}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <span className="theme-track">
            {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
          </span>
          <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
        </button>
        <div className="profile">
          <div className="avatar">{user?.email?.slice(0, 2).toUpperCase() || 'OP'}</div>
          <div>
            <b>{user?.email?.split('@')[0] || 'User'}</b>
            <small>{user?.role}</small>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={17} /> Log out
        </button>
      </div>
    </aside>
  );
}

function Header({ setOpen, user }) {
  return (
    <header>
      <button className="hamburger" onClick={() => setOpen(true)}><Menu size={24} /></button>
      <div className="crumb">
        <span>Operations</span>
        <i>/</i>
        <b>Dashboard</b>
      </div>
      <div className="header-actions">
        <label className="search">
          <Search size={18} />
          <input placeholder="Search anything..." />
          <kbd>⌘ K</kbd>
        </label>
        <button className="round-button">
          <Bell size={19} />
          <i className="notif-dot" />
        </button>
        <div className="header-avatar">{user?.email?.slice(0, 2).toUpperCase()}</div>
      </div>
    </header>
  );
}

function Login({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("manager@transitops.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email || !password) return setError("Enter your email and password to continue.");
    setLoading(true);
    setError("");

    try {
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('transitops_token', res.token);
      localStorage.setItem('transitops_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow glow-one" />
      <div className="login-glow glow-two" />
      <section className="login-visual">
        <div className="login-brand">
          <div className="brand-mark"><Truck size={22} /></div>
          <span>Transit<span>Ops</span></span>
        </div>
        <div className="visual-copy">
          <p>SMART FLEET OPERATIONS</p>
          <h1>Every mile,<br /><em>in control.</em></h1>
          <span>Run a safer, more efficient fleet from one powerful operations hub.</span>
        </div>
        <div className="route-card">
          <div className="route-top">
            <span><i className="route-origin" /> Pune Hub</span>
            <span>09:42 AM</span>
          </div>
          <div className="route-line"><i /><Truck size={23} /><i /></div>
          <div className="route-top">
            <span><i className="route-destination" /> Mumbai Port</span>
            <Status color="green">On schedule</Status>
          </div>
        </div>
        <div className="visual-footer">
          <span>© 2026 TransitOps</span>
          <span>Secure fleet intelligence</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-mobile-brand">
          <div className="brand-mark"><Truck size={19} /></div>
          <b>Transit<span>Ops</span></b>
        </div>
        <form onSubmit={submit} className="login-card">
          <div className="login-heading">
            <p>WELCOME BACK</p>
            <h2>Sign in to your workspace</h2>
            <span>Enter your details to manage your fleet.</span>
          </div>
          <label className="field-label">
            Work email
            <div className="input-wrap">
              <Mail size={18} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
                required
              />
            </div>
          </label>
          <label className="field-label">
            Password
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to TransitOps"} <ArrowRight size={18} />
          </button>
        </form>
        <div className="login-security">
          <CheckCircle2 size={15} /> Your data is protected with enterprise-grade security.
        </div>
      </section>
    </div>
  );
}

function VehiclePage({ showToast }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    registrationNumber: "",
    modelName: "",
    type: "truck",
    maxLoadCapacity: 15000,
    odometer: 0,
    acquisitionCost: 100000,
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/vehicles');
      setVehicles(res);
    } catch (err) {
      showToast(err.message, "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const addVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/api/vehicles', form);
      showToast("Vehicle registered successfully", "green");
      setAdding(false);
      setForm({
        registrationNumber: "",
        modelName: "",
        type: "truck",
        maxLoadCapacity: 15000,
        odometer: 0,
        acquisitionCost: 100000,
      });
      fetchVehicles();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  const handleRetire = async (id) => {
    try {
      await client.put(`/api/vehicles/${id}/retire`);
      showToast("Vehicle status updated to Retired", "green");
      setSelected(null);
      fetchVehicles();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle registry?")) return;
    try {
      await client.delete(`/api/vehicles/${id}`);
      showToast("Vehicle removed from registry", "green");
      setSelected(null);
      fetchVehicles();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  const filtered = vehicles.filter(v => 
    (statusFilter === "All statuses" || v.status === statusFilter) &&
    `${v.registrationNumber} ${v.modelName} ${v.type}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="vehicle-page">
      <div className="vehicle-title">
        <div>
          <p className="eyebrow">FLEET MANAGEMENT</p>
          <h1>Vehicle registry</h1>
          <p className="subtitle">Manage vehicle availability, status, and maintenance windows.</p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}><Plus size={17} /> Add vehicle</button>
      </div>

      <div className="vehicle-summary">
        <Card><IconTile icon={Truck} color="blue" /><div><span>Total vehicles</span><b>{vehicles.length}</b></div></Card>
        <Card><IconTile icon={ShieldCheck} color="green" /><div><span>Available now</span><b>{vehicles.filter(v => v.status === "Available").length}</b></div></Card>
        <Card><IconTile icon={Activity} color="purple" /><div><span>On Trip</span><b>{vehicles.filter(v => v.status === "On Trip").length}</b></div></Card>
        <Card><IconTile icon={ToolCase} color="amber" /><div><span>In Shop</span><b>{vehicles.filter(v => v.status === "In Shop").length}</b></div></Card>
      </div>

      <Card className="registry-card">
        <div className="registry-toolbar">
          <label className="registry-search">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search registration, model..." />
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All statuses</option>
            <option>Available</option>
            <option>On Trip</option>
            <option>In Shop</option>
            <option>Retired</option>
          </select>
          <button className="filter" onClick={() => window.open('http://localhost:3000/api/reports/export?type=vehicles')}>
            <FileText size={16} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading registry...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No vehicles matched your search filter.</div>
        ) : (
          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Max load capacity</th>
                  <th>Odometer</th>
                  <th>Acquisition cost</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} onClick={() => setSelected(v)}>
                    <td>
                      <div className="vehicle-identity">
                        <div className="vehicle-symbol"><Truck size={18} /></div>
                        <span><b>{v.registrationNumber}</b><small>{v.modelName}</small></span>
                      </div>
                    </td>
                    <td>{v.type}</td>
                    <td>{v.maxLoadCapacity} kg</td>
                    <td>{v.odometer} km</td>
                    <td>₹{v.acquisitionCost}</td>
                    <td>
                      <span className={`vehicle-status ${v.status.toLowerCase().replaceAll(" ", "-")}`}>
                        <i />{v.status}
                      </span>
                    </td>
                    <td>
                      <button className="row-action" onClick={(e) => { e.stopPropagation(); setSelected(v); }}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <>
          <div className="vehicle-overlay" onClick={() => setSelected(null)} />
          <aside className="vehicle-drawer">
            <button className="panel-close" onClick={() => setSelected(null)}><X size={18} /></button>
            <div className="drawer-vehicle-art">
              <Truck size={54} />
              <span>{selected.type}</span>
            </div>
            <p className="eyebrow">VEHICLE DETAILS</p>
            <h2>{selected.modelName}</h2>
            <h3>{selected.registrationNumber}</h3>
            
            <div className="drawer-status">
              <span className={`vehicle-status ${selected.status.toLowerCase().replaceAll(" ", "-")}`}>
                <i />{selected.status}
              </span>
            </div>

            <div className="drawer-grid">
              <span>Capacity<b>{selected.maxLoadCapacity} kg</b></span>
              <span>Odometer<b>{selected.odometer} km</b></span>
              <span>Acquisition Cost<b>₹{selected.acquisitionCost}</b></span>
            </div>

            <div className="drawer-actions-row" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button 
                className="filter" 
                onClick={() => handleRetire(selected.id)} 
                disabled={selected.status === 'Retired' || selected.status === 'On Trip'}
                style={{ flex: 1, borderColor: '#f3b748', color: '#f3b748' }}
              >
                Retire Asset
              </button>
              <button 
                className="filter" 
                onClick={() => handleDelete(selected.id)} 
                disabled={selected.status === 'On Trip'}
                style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
              >
                Delete Registry
              </button>
            </div>
          </aside>
        </>
      )}

      {adding && (
        <>
          <div className="vehicle-overlay" onClick={() => setAdding(false)} />
          <form className="add-vehicle-modal" onSubmit={addVehicle}>
            <button type="button" className="panel-close" onClick={() => setAdding(false)}><X size={18} /></button>
            <p className="eyebrow">NEW FLEET ASSET</p>
            <h2>Register vehicle</h2>
            <div className="vehicle-form-grid">
              <label>
                Registration number
                <input
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  placeholder="e.g. MH 12 AB 1042"
                  required
                />
              </label>
              <label>
                Model name
                <input
                  value={form.modelName}
                  onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  placeholder="e.g. Volvo VNL 860"
                  required
                />
              </label>
              <label>
                Vehicle type
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="truck">Heavy Truck</option>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                </select>
              </label>
              <label>
                Max capacity (kg)
                <input
                  type="number"
                  value={form.maxLoadCapacity}
                  onChange={(e) => setForm({ ...form, maxLoadCapacity: parseFloat(e.target.value) })}
                  required
                />
              </label>
              <label>
                Initial odometer (km)
                <input
                  type="number"
                  value={form.odometer}
                  onChange={(e) => setForm({ ...form, odometer: parseFloat(e.target.value) })}
                />
              </label>
              <label>
                Acquisition cost (INR)
                <input
                  type="number"
                  value={form.acquisitionCost}
                  onChange={(e) => setForm({ ...form, acquisitionCost: parseFloat(e.target.value) })}
                />
              </label>
            </div>
            <button className="login-submit" type="submit">Add to registry <ArrowRight size={17} /></button>
          </form>
        </>
      )}
    </div>
  );
}

function DriversPage({ showToast }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "CDL-A",
    licenseExpiryDate: "",
    contactNumber: "",
    safetyScore: 95.0,
    status: "Available"
  });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/drivers');
      setDrivers(res);
    } catch (err) {
      showToast(err.message, "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const addDriver = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/drivers', form);
      showToast("Driver registered successfully", "green");
      setAdding(false);
      setForm({
        name: "",
        licenseNumber: "",
        licenseCategory: "CDL-A",
        licenseExpiryDate: "",
        contactNumber: "",
        safetyScore: 95.0,
        status: "Available"
      });
      fetchDrivers();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-title">
        <div>
          <p className="eyebrow">DRIVER MANAGEMENT</p>
          <h1>Driver registry</h1>
          <p className="subtitle">Manage operator profiles, safety compliance, and license expirations.</p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}><Plus size={17} /> Add driver</button>
      </div>

      <Card className="registry-card">
        {loading ? (
          <div className="loading-state">Loading drivers registry...</div>
        ) : drivers.length === 0 ? (
          <div className="empty-state">No drivers registered.</div>
        ) : (
          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>License Number</th>
                  <th>Category</th>
                  <th>License Expiration</th>
                  <th>Contact</th>
                  <th>Safety Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id}>
                    <td><b>{d.name}</b></td>
                    <td>{d.licenseNumber}</td>
                    <td>{d.licenseCategory}</td>
                    <td>{new Date(d.licenseExpiryDate).toLocaleDateString()}</td>
                    <td>{d.contactNumber}</td>
                    <td>{d.safetyScore} %</td>
                    <td>
                      <span className={`vehicle-status ${d.status.toLowerCase().replaceAll(" ", "-")}`}>
                        <i />{d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adding && (
        <>
          <div className="vehicle-overlay" onClick={() => setAdding(false)} />
          <form className="add-vehicle-modal" onSubmit={addDriver}>
            <button type="button" className="panel-close" onClick={() => setAdding(false)}><X size={18} /></button>
            <p className="eyebrow">NEW OPERATOR asset</p>
            <h2>Add driver</h2>
            <div className="vehicle-form-grid">
              <label>
                Full Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                />
              </label>
              <label>
                License Number
                <input
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  placeholder="e.g. DL-12345"
                  required
                />
              </label>
              <label>
                License Category
                <select value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
                  <option value="CDL-A">CDL Heavy Class A</option>
                  <option value="CDL-B">CDL Class B</option>
                  <option value="Light-Class">Light Commercial</option>
                </select>
              </label>
              <label>
                License Expiration Date
                <input
                  type="date"
                  value={form.licenseExpiryDate}
                  onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Contact Number
                <input
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="e.g. 555-0100"
                  required
                />
              </label>
              <label>
                Safety Rating (%)
                <input
                  type="number"
                  step="0.1"
                  value={form.safetyScore}
                  onChange={(e) => setForm({ ...form, safetyScore: parseFloat(e.target.value) })}
                />
              </label>
            </div>
            <button className="login-submit" type="submit">Register Driver <ArrowRight size={17} /></button>
          </form>
        </>
      )}
    </div>
  );
}

function TripsPage({ showToast }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/trips');
      setTrips(res);
    } catch (err) {
      showToast(err.message, "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await client.put(`/api/trips/${id}/${action}`);
      showToast(`Trip ${action} successfully`, "green");
      fetchTrips();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-title">
        <div>
          <p className="eyebrow">LIVE RUN LOGS</p>
          <h1>Trips & dispatch board</h1>
          <p className="subtitle">Track transit schedules, dispatch operations, and resource handbacks.</p>
        </div>
      </div>

      <Card className="registry-card">
        {loading ? (
          <div className="loading-state">Loading trip board...</div>
        ) : trips.length === 0 ? (
          <div className="empty-state">No trips found. Use the Dashboard to create one.</div>
        ) : (
          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Vehicle Registration</th>
                  <th>Driver assigned</th>
                  <th>Cargo load</th>
                  <th>Planned Distance</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t.id}>
                    <td><b>{t.source} → {t.destination}</b></td>
                    <td>{t.vehicle?.registrationNumber || 'Unassigned'}</td>
                    <td>{t.driver?.name || 'Unassigned'}</td>
                    <td>{t.cargoWeight} kg</td>
                    <td>{t.plannedDistance} km</td>
                    <td>₹{t.revenue}</td>
                    <td>
                      <span className={`vehicle-status ${t.status.toLowerCase().replaceAll(" ", "-")}`}>
                        <i />{t.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {t.status === 'Draft' && (
                          <button className="primary" onClick={() => handleAction(t.id, 'dispatch')} style={{ padding: '4px 8px', fontSize: '11px' }}>
                            Dispatch
                          </button>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button className="primary" onClick={() => handleAction(t.id, 'complete')} style={{ padding: '4px 8px', fontSize: '11px', background: '#22c55e' }}>
                              Complete
                            </button>
                            <button className="filter" onClick={() => handleAction(t.id, 'cancel')} style={{ padding: '4px 8px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444' }}>
                              Cancel
                            </button>
                          </>
                        )}
                        {t.status === 'Completed' && <span style={{ color: '#22c55e', fontSize: '11px' }}>Done</span>}
                        {t.status === 'Cancelled' && <span style={{ color: '#ef4444', fontSize: '11px' }}>Cancelled</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function MaintenancePage({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    cost: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        client.get('/api/maintenance'),
        client.get('/api/vehicles')
      ]);
      setLogs(logsRes);
      setVehicles(vehiclesRes.filter(v => v.status === "Available"));
      if (vehiclesRes.length > 0) {
        setForm(f => ({ ...f, vehicleId: vehiclesRes[0].id }));
      }
    } catch (err) {
      showToast(err.message, "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openLog = async (e) => {
    e.preventDefault();
    if (!form.vehicleId) return showToast("Select an available vehicle first", "red");
    try {
      await client.post('/api/maintenance', form);
      showToast("Maintenance ticket logged, vehicle set to In Shop", "green");
      setAdding(false);
      fetchData();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  const closeLog = async (id) => {
    const costInput = window.prompt("Enter total maintenance expense cost (INR):", "500");
    if (costInput === null) return;
    const cost = parseFloat(costInput) || 0;
    try {
      await client.put(`/api/maintenance/${id}/close`, { cost });
      showToast("Maintenance closed, vehicle returned to Available status", "green");
      fetchData();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-title">
        <div>
          <p className="eyebrow">FLEET CARE</p>
          <h1>Maintenance history & logs</h1>
          <p className="subtitle">Schedule periodic care, emergency fixes, and track vehicle repair states.</p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}><Plus size={17} /> Open ticket</button>
      </div>

      <Card className="registry-card">
        {loading ? (
          <div className="loading-state">Loading maintenance logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">No maintenance records logged.</div>
        ) : (
          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Vehicle Registration</th>
                  <th>Description</th>
                  <th>Service Start</th>
                  <th>Completion Date</th>
                  <th>Reported Cost</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td><b>{l.vehicle?.registrationNumber}</b></td>
                    <td>{l.description}</td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{l.endDate ? new Date(l.endDate).toLocaleDateString() : 'In Progress'}</td>
                    <td>₹{l.cost}</td>
                    <td>
                      <span className={`vehicle-status ${l.status === 'Open' ? 'in-shop' : 'available'}`}>
                        <i />{l.status === 'Open' ? 'In Maintenance' : 'Completed'}
                      </span>
                    </td>
                    <td>
                      {l.status === 'Open' ? (
                        <button className="primary" onClick={() => closeLog(l.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Close Service
                        </button>
                      ) : (
                        <span style={{ color: '#22c55e', fontSize: '11px' }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adding && (
        <>
          <div className="vehicle-overlay" onClick={() => setAdding(false)} />
          <form className="add-vehicle-modal" onSubmit={openLog}>
            <button type="button" className="panel-close" onClick={() => setAdding(false)}><X size={18} /></button>
            <p className="eyebrow">FLEET MAINTENANCE WINDOW</p>
            <h2>Log service ticket</h2>
            <div className="vehicle-form-grid">
              <label>
                Select Vehicle
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} ({v.modelName})</option>
                  ))}
                </select>
              </label>
              <label>
                Service Description
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Oil change and brake system tuning"
                  required
                />
              </label>
              <label>
                Maintenance Start Date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Estimated Base Cost
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) })}
                />
              </label>
            </div>
            <button className="login-submit" type="submit">Open Maintenance Log <ArrowRight size={17} /></button>
          </form>
        </>
      )}
    </div>
  );
}

function ExpensesPage({ showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: "",
    type: "Fuel",
    metricUnits: 0,
    cost: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, vehRes] = await Promise.all([
        client.get('/api/expenses'),
        client.get('/api/vehicles')
      ]);
      setExpenses(expRes);
      setVehicles(vehRes);
      if (vehRes.length > 0) {
        setForm(f => ({ ...f, vehicleId: vehRes[0].id }));
      }
    } catch (err) {
      showToast(err.message, "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!form.vehicleId) return showToast("Select a vehicle first", "red");
    try {
      await client.post('/api/expenses', form);
      showToast("Expense logged successfully", "green");
      setAdding(false);
      fetchData();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-title">
        <div>
          <p className="eyebrow">OPERATION FINANCES</p>
          <h1>Expense & fuel registry</h1>
          <p className="subtitle">Monitor operational expenses, toll sheets, and diesel fuel tracking.</p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}><Plus size={17} /> Record expense</button>
      </div>

      <Card className="registry-card">
        {loading ? (
          <div className="loading-state">Loading expenses log...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No expenses found.</div>
        ) : (
          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Log Date</th>
                  <th>Category</th>
                  <th>Metric Units</th>
                  <th>Cost Total</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td><b>{e.type}</b></td>
                    <td>{e.metricUnits ? `${e.metricUnits} L` : '—'}</td>
                    <td>₹{e.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adding && (
        <>
          <div className="vehicle-overlay" onClick={() => setAdding(false)} />
          <form className="add-vehicle-modal" onSubmit={addExpense}>
            <button type="button" className="panel-close" onClick={() => setAdding(false)}><X size={18} /></button>
            <p className="eyebrow">FINANCIAL LEDGER</p>
            <h2>Log expense</h2>
            <div className="vehicle-form-grid">
              <label>
                Select Vehicle
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} ({v.modelName})</option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="Fuel">Fuel</option>
                  <option value="Toll">Tolls</option>
                  <option value="Misc">Misc / Other</option>
                </select>
              </label>
              {form.type === "Fuel" && (
                <label>
                  Liters
                  <input
                    type="number"
                    value={form.metricUnits}
                    onChange={(e) => setForm({ ...form, metricUnits: parseFloat(e.target.value) })}
                    required
                  />
                </label>
              )}
              <label>
                Total cost (INR)
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) })}
                  required
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
            </div>
            <button className="login-submit" type="submit">Record Expense <ArrowRight size={17} /></button>
          </form>
        </>
      )}
    </div>
  );
}

function TripModal({ onClose, onCreate, showToast }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeight: 10000,
    plannedDistance: 100,
    revenue: 5000,
  });

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    if (step === 2) {
      // Fetch available operators and fleet assets from state endpoints
      Promise.all([
        client.get('/api/trips/available/vehicles'),
        client.get('/api/trips/available/drivers')
      ]).then(([vehiclesRes, driversRes]) => {
        setAvailableVehicles(vehiclesRes);
        setAvailableDrivers(driversRes);
        setForm(f => ({
          ...f,
          vehicleId: vehiclesRes[0]?.id || "",
          driverId: driversRes[0]?.id || ""
        }));
      }).catch((err) => {
        showToast(err.message, "red");
      });
    }
  }, [step]);

  const canNext = step === 1
    ? form.source && form.destination
    : step === 2
    ? form.vehicleId && form.driverId
    : form.cargoWeight;

  return (
    <>
      <div className="vehicle-overlay" onClick={onClose} />
      <section className="trip-modal">
        <button className="panel-close" onClick={onClose}><X size={18} /></button>
        <p className="eyebrow">NEW DISPATCH</p>
        <h2>Create a trip</h2>
        <div className="trip-steps">
          {["Route", "Assignment", "Cargo", "Review"].map((label, index) => (
            <span key={label} className={step >= index + 1 ? "current" : ""}>
              <i>{index + 1}</i>{label}
            </span>
          ))}
        </div>

        {step === 1 && (
          <div className="trip-form">
            <label>
              Pickup location
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Pune Hub" />
            </label>
            <label>
              Destination
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Mumbai Port" />
            </label>
            <label>
              Planned Distance (km)
              <input type="number" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: parseFloat(e.target.value) })} />
            </label>
            <label>
              Projected Revenue (INR)
              <input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: parseFloat(e.target.value) })} />
            </label>
            <div className="trip-validation"><MapPin size={16} /> Route distance will check fuel projections.</div>
          </div>
        )}

        {step === 2 && (
          <div className="trip-form">
            <label>
              Available vehicle
              <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                {availableVehicles.length === 0 ? (
                  <option value="">No vehicles available</option>
                ) : (
                  availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} ({v.modelName})</option>
                  ))
                )}
              </select>
            </label>
            <label>
              Driver on duty
              <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                {availableDrivers.length === 0 ? (
                  <option value="">No drivers available</option>
                ) : (
                  availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Safety Score: {d.safetyScore}%)</option>
                  ))
                )}
              </select>
            </label>
            <div className="trip-validation good"><ShieldCheck size={16} /> Eligible operators and assets.</div>
          </div>
        )}

        {step === 3 && (
          <div className="trip-form">
            <label>
              Cargo weight (kg)
              <input type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: parseFloat(e.target.value) })} />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="trip-review">
            <span>Route<b>{form.source} → {form.destination}</b></span>
            <span>Vehicle ID<b>{form.vehicleId}</b></span>
            <span>Driver ID<b>{form.driverId}</b></span>
            <span>Cargo load<b>{form.cargoWeight} kg</b></span>
            <div className="trip-validation good"><ShieldCheck size={16} /> Ready to commit to state machine.</div>
          </div>
        )}

        <div className="trip-modal-actions">
          <button className="filter" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button className="primary" disabled={!canNext && step < 4} onClick={() => step === 4 ? onCreate(form) : setStep(step + 1)}>
            {step === 4 ? "Dispatch trip" : "Continue"}<ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState("light");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [tripModal, setTripModal] = useState(false);
  
  // Dashboard states
  const [stats, setStats] = useState({
    vehicles: { total: 0, available: 0, onTrip: 0, inShop: 0 },
    drivers: { total: 0, available: 0 },
    trips: { total: 0, active: 0, completed: 0, cancelled: 0 }
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [costAnalysis, setCostAnalysis] = useState({ totalFuel: 0, totalMaintenance: 0 });

  const showToast = (message, color = "green") => {
    setToast({ message, color });
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setAuthenticated(false);
    setUser(null);
  };

  const fetchDashboardData = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes, maintenanceRes, expensesRes] = await Promise.all([
        client.get('/api/vehicles'),
        client.get('/api/drivers'),
        client.get('/api/trips'),
        client.get('/api/maintenance'),
        client.get('/api/expenses')
      ]);

      const onTripVehicles = vehiclesRes.filter(v => v.status === "On Trip").length;
      const inShopVehicles = vehiclesRes.filter(v => v.status === "In Shop").length;
      const availableVehicles = vehiclesRes.filter(v => v.status === "Available").length;

      setStats({
        vehicles: { total: vehiclesRes.length, available: availableVehicles, onTrip: onTripVehicles, inShop: inShopVehicles },
        drivers: { total: driversRes.length, available: driversRes.filter(d => d.status === "Available").length },
        trips: {
          total: tripsRes.length,
          active: tripsRes.filter(t => t.status === "Dispatched").length,
          completed: tripsRes.filter(t => t.status === "Completed").length,
          cancelled: tripsRes.filter(t => t.status === "Cancelled").length
        }
      });

      setRecentTrips(tripsRes.slice(0, 5));

      const fuelSum = expensesRes.filter(e => e.type === "Fuel").reduce((sum, e) => sum + e.cost, 0);
      const maintSum = maintenanceRes.reduce((sum, l) => sum + l.cost, 0);
      setCostAnalysis({ totalFuel: fuelSum, totalMaintenance: maintSum });

    } catch (err) {
      showToast(err.message, "red");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    const storedUser = localStorage.getItem('transitops_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData();
    }
  }, [authenticated, page]);

  const handleCreateTrip = async (formPayload) => {
    try {
      // 1. Create trip record as Draft
      const res = await client.post('/api/trips', formPayload);
      
      // 2. Automatically dispatch it as requested by Member 3 dispatch flow
      await client.put(`/api/trips/${res.id}/dispatch`);

      showToast("Trip created and dispatched successfully!", "green");
      setTripModal(false);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, "red");
    }
  };

  const today = useMemo(() => new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date()), []);

  if (!authenticated) {
    return <Login onLoginSuccess={(u) => { setUser(u); setAuthenticated(true); }} />;
  }

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        open={open}
        setOpen={setOpen}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onLogout={logout}
        page={page}
        setPage={setPage}
      />
      <main>
        <Header setOpen={setOpen} user={user} />
        <div className="content">
          {page === "Vehicles" && <VehiclePage showToast={showToast} />}
          {page === "Drivers" && <DriversPage showToast={showToast} />}
          {page === "Trips" && <TripsPage showToast={showToast} />}
          {page === "Maintenance" && <MaintenancePage showToast={showToast} />}
          {page === "Expenses" && <ExpensesPage showToast={showToast} />}

          {page === "Dashboard" && (
            <>
              <div className="title-row">
                <div>
                  <p className="eyebrow">{today}</p>
                  <h1>Good morning, Dispatcher <span>👋</span></h1>
                  <p className="subtitle">Real-time status overview of the TransitOps fleet.</p>
                </div>
                <div className="title-actions">
                  <button className="primary" onClick={() => setTripModal(true)}><Zap size={17} /> Create trip</button>
                </div>
              </div>

              <div className="kpi-grid">
                <Kpi icon={Truck} color="blue" value={stats.vehicles.total} label="Active fleet size" change="4.1%" />
                <Kpi icon={ShieldCheck} color="green" value={stats.vehicles.available} label="Available vehicles" change="5.4%" />
                <Kpi icon={ToolCase} color="amber" value={stats.vehicles.inShop} label="Assets in maintenance" change="2.1%" down />
                <Kpi icon={Activity} color="purple" value={stats.trips.active} label="Active transit runs" change="12.6%" />
              </div>

              <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Card className="util" style={{ flex: 1 }}>
                  <div className="card-heading">
                    <div>
                      <p>FLEET PERFORMANCE</p>
                      <h2>Fleet run counts</h2>
                    </div>
                  </div>
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Active Runs</span><b>{stats.trips.active}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Completed Deliveries</span><b>{stats.trips.completed}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cancelled Runs</span><b>{stats.trips.cancelled}</b>
                    </div>
                  </div>
                </Card>

                <Card className="costs" style={{ flex: 1 }}>
                  <div className="card-heading">
                    <div>
                      <p>FINANCIAL METRICS</p>
                      <h2>Total Maintenance & Fuel Cost</h2>
                    </div>
                  </div>
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Fuel Expense</span><b>₹{costAnalysis.totalFuel}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Maintenance Care Expense</span><b>₹{costAnalysis.totalMaintenance}</b>
                    </div>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>Total Operations Cost</span><b>₹{costAnalysis.totalFuel + costAnalysis.totalMaintenance}</b>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bottom-row">
                <Card className="board" style={{ width: '100%' }}>
                  <div className="card-heading">
                    <div>
                      <p>LIVE MONITORING</p>
                      <h2>Recent trips run board</h2>
                    </div>
                  </div>
                  <div className="vehicle-table-wrap" style={{ marginTop: '16px' }}>
                    <table className="vehicle-table">
                      <thead>
                        <tr>
                          <th>Trip ID</th>
                          <th>Route</th>
                          <th>Status</th>
                          <th>Cargo Load</th>
                          <th>Odometer run</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTrips.map(rt => (
                          <tr key={rt.id}>
                            <td><code>{rt.id.slice(0, 8)}</code></td>
                            <td>{rt.source} → {rt.destination}</td>
                            <td>
                              <span className={`vehicle-status ${rt.status.toLowerCase().replaceAll(" ", "-")}`}>
                                <i />{rt.status}
                              </span>
                            </td>
                            <td>{rt.cargoWeight} kg</td>
                            <td>{rt.plannedDistance} km</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}

          {toast && (
            <div className={`toast ${toast.color === 'red' ? 'negative' : ''}`} style={{ borderLeft: `4px solid ${toast.color === 'red' ? '#ef4444' : '#22c55e'}` }}>
              {toast.color === 'red' ? <X size={20} style={{ color: '#ef4444' }} /> : <ShieldCheck size={20} style={{ color: '#22c55e' }} />}
              <div>
                <b>{toast.color === 'red' ? 'Operation Error' : 'Success notification'}</b>
                <span>{toast.message}</span>
              </div>
              <button onClick={() => setToast(null)}><X size={16} /></button>
            </div>
          )}
        </div>
      </main>

      {tripModal && <TripModal onClose={() => setTripModal(false)} onCreate={handleCreateTrip} showToast={showToast} />}
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
