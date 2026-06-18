import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleDashed,
  Clock3,
  Dumbbell,
  FileCheck2,
  Fingerprint,
  HeartPulse,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Play,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Database,
  UserRound,
} from 'lucide-react';
import { ApiError, odinApi } from './api/client';
import type {
  AthleteInput,
  ProgrammeDay,
  ProgrammeResponse,
  RefinementMode,
} from './api/contracts';
import { defaultProfile } from './fixtures/default-profile';
import {
  isSupabaseAuthConfigured,
  supabaseAuth,
} from './auth/supabase';
import { athleteInputSchema } from './profile/profile-schema';

type Notice = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message: string;
  details?: unknown;
};

type BusyAction =
  | 'health'
  | 'auth'
  | 'profile-load'
  | 'profile'
  | 'generate'
  | 'current'
  | 'lookup'
  | null;

type ProfileLoadState =
  | { status: 'default' }
  | { status: 'loading' }
  | { status: 'loaded'; updatedAt: string | null }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

const labelize = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const errorNotice = (error: unknown): Notice => {
  if (error instanceof ApiError) {
    return {
      tone: 'error',
      title: error.code,
      message: error.message,
      details: error.details,
    };
  }
  return {
    tone: 'error',
    title: 'UNEXPECTED_ERROR',
    message: error instanceof Error ? error.message : 'Something went wrong.',
  };
};

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {hint ? <span className="field-hint">{hint}</span> : null}
  </label>
);

const Button = ({
  children,
  busy = false,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}) => (
  <button
    {...props}
    className={`button button-${variant} ${props.className ?? ''}`}
  >
    {busy ? <Loader2 size={16} className="spin" /> : null}
    {children}
  </button>
);

const StatusPill = ({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'positive' | 'warning' | 'negative' | 'neutral' | 'purple';
}) => <span className={`status-pill status-${tone}`}>{children}</span>;

const ScoreRing = ({ score }: { score: number }) => (
  <div
    className="score-ring"
    style={{ '--score': `${Math.max(0, Math.min(100, score)) * 3.6}deg` } as React.CSSProperties}
  >
    <div>
      <strong>{Math.round(score)}</strong>
      <span>/100</span>
    </div>
  </div>
);

const WorkoutDay = ({ day }: { day: ProgrammeDay }) => (
  <details className={`workout-day workout-${day.workout_type}`}>
    <summary>
      <div className="day-code">{day.day_of_week.slice(0, 3)}</div>
      <div className="day-heading">
        <strong>{day.title || labelize(day.workout_type)}</strong>
        <span>
          {day.subtitle ||
            (day.workout_type === 'rest'
              ? 'Recovery day'
              : `${day.exercises.length} exercises`)}
        </span>
      </div>
      <div className="day-meta">
        {day.duration_min ? (
          <span>
            <Clock3 size={14} /> {day.duration_min} min
          </span>
        ) : null}
        <StatusPill>
          {day.workout_type === 'liss' ? 'LISS' : labelize(day.workout_type)}
        </StatusPill>
        <ChevronDown size={18} className="chevron" />
      </div>
    </summary>
    <div className="day-content">
      {day.liss_content ? <p className="liss-copy">{day.liss_content}</p> : null}
      {day.exercises.map((exercise) => (
        <div className="exercise-row" key={exercise.exercise_id}>
          <div className="exercise-order">
            {String(exercise.display_order + 1).padStart(2, '0')}
          </div>
          <div className="exercise-main">
            <strong>{exercise.exercise_name}</strong>
            <span>{exercise.primary_muscles.map(labelize).join(' · ')}</span>
          </div>
          <div className="set-chips">
            {exercise.sets.map((set) => (
              <span key={set.set_number}>
                {set.target_reps} reps
                <small> RPE {set.target_rpe}</small>
              </span>
            ))}
          </div>
          <div className="rest-copy">
            {exercise.sets[0]?.rest_seconds ?? 0}s rest
          </div>
        </div>
      ))}
    </div>
  </details>
);

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<AthleteInput>(defaultProfile);
  const [profileLoad, setProfileLoad] =
    useState<ProfileLoadState>({ status: 'default' });
  const [refinementMode, setRefinementMode] =
    useState<RefinementMode>('deterministic');
  const [replaceDraft, setReplaceDraft] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [programme, setProgramme] = useState<ProgrammeResponse | null>(null);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [health, setHealth] = useState<{
    status: 'checking' | 'online' | 'offline';
    version?: string;
  }>({ status: 'checking' });

  const activeDays = useMemo(() => {
    if (!programme) return [];
    return (
      programme.programme.phase_week_templates.find(
        (template) => template.phase_number === selectedPhase,
      )?.days ?? []
    );
  }, [programme, selectedPhase]);

  const run = async <T,>(
    action: Exclude<BusyAction, null>,
    operation: () => Promise<T>,
    onSuccess: (value: T) => void,
  ) => {
    setBusy(action);
    setNotice(null);
    try {
      onSuccess(await operation());
    } catch (error) {
      setNotice(errorNotice(error));
    } finally {
      setBusy(null);
    }
  };

  const checkHealth = () =>
    run(
      'health',
      odinApi.health,
      (data) => {
        setHealth({ status: 'online', version: data.version });
        setNotice({
          tone: 'success',
          title: 'API connected',
          message: `Agent Odin ${data.version} is healthy.`,
        });
      },
    ).catch(() => setHealth({ status: 'offline' }));

  useEffect(() => {
    odinApi
      .health()
      .then((data) => setHealth({ status: 'online', version: data.version }))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  useEffect(() => {
    if (!supabaseAuth) return;

    void supabaseAuth.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? '');
      setSessionEmail(data.session?.user.email ?? null);
    });

    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? '');
      setSessionEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAuthenticatedProfile = async (showNotice = true) => {
    const authClient = supabaseAuth;

    if (!authClient) return;

    setBusy('profile-load');
    setProfileLoad({ status: 'loading' });

    try {
      const { data, error } = await authClient
        .from('athlete_profiles')
        .select('athlete_data,updated_at')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setProfile(defaultProfile);
        setProfileLoad({ status: 'not_found' });
        if (showNotice) {
          setNotice({
            tone: 'info',
            title: 'Signed in — no saved profile',
            message:
              'Authentication succeeded. Complete the default form and save it to create this user’s athlete profile.',
          });
        }
        return;
      }

      const parsed = athleteInputSchema.safeParse(data.athlete_data);

      if (!parsed.success) {
        throw new Error(
          'The saved athlete profile does not match the current profile schema.',
        );
      }

      setProfile(parsed.data);
      setProfileLoad({
        status: 'loaded',
        updatedAt:
          typeof data.updated_at === 'string' ? data.updated_at : null,
      });
      if (showNotice) {
        setNotice({
          tone: 'success',
          title: 'Profile loaded',
          message:
            'Supabase authentication is valid and this user’s saved athlete profile populated the form.',
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Profile loading failed.';
      setProfileLoad({ status: 'error', message });
      if (showNotice) {
        setNotice({
          tone: 'error',
          title: 'PROFILE_LOAD_FAILED',
          message,
        });
      }
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!token) {
      setProfileLoad({ status: 'default' });
      return;
    }

    void loadAuthenticatedProfile(true);
  }, [token]);

  const requireToken = (): boolean => {
    if (token.trim()) return true;
    setNotice({
      tone: 'info',
      title: 'Sign in required',
      message:
        'Sign in with a Supabase development test user before calling a protected endpoint.',
    });
    return false;
  };

  const signIn = () => {
    const authClient = supabaseAuth;

    if (!authClient) {
      setNotice({
        tone: 'info',
        title: 'Supabase configuration required',
        message:
          'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to demo-ui/.env.local, then restart Vite.',
      });
      return;
    }
    if (!email.trim() || !password) {
      setNotice({
        tone: 'info',
        title: 'Credentials required',
        message: 'Enter the email and password for a development test user.',
      });
      return;
    }

    void run(
      'auth',
      async () => {
        const { data, error } = await authClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) throw new Error('Supabase did not return a session.');
        return data.session;
      },
      (session) => {
        setToken(session.access_token);
        setSessionEmail(session.user.email ?? email.trim());
        setPassword('');
        setNotice({
          tone: 'success',
          title: 'Signed in',
          message: `Connected as ${session.user.email ?? 'Supabase test user'}.`,
        });
      },
    );
  };

  const signOut = () => {
    const authClient = supabaseAuth;

    if (!authClient) return;
    void run(
      'auth',
      async () => {
        const { error } = await authClient.auth.signOut();
        if (error) throw error;
      },
      () => {
        setToken('');
        setSessionEmail(null);
        setProfile(defaultProfile);
        setProfileLoad({ status: 'default' });
        setProgramme(null);
        setNotice({
          tone: 'success',
          title: 'Signed out',
          message: 'The local Supabase session has been cleared.',
        });
      },
    );
  };

  const updateProfile = <K extends keyof AthleteInput>(
    key: K,
    value: AthleteInput[K],
  ) => setProfile((current) => ({ ...current, [key]: value }));

  const saveProfile = () => {
    if (!requireToken()) return;
    void run(
      'profile',
      () => odinApi.saveProfile(token.trim(), profile),
      () =>
        void loadAuthenticatedProfile(false).then(() =>
          setNotice({
            tone: 'success',
            title: 'Profile saved and verified',
            message:
              'The profile was saved through Odin and read back from Supabase for the authenticated user.',
          }),
        ),
    );
  };

  const generate = () => {
    if (!requireToken()) return;
    void run(
      'generate',
      () =>
        odinApi.generate(
          token.trim(),
          {
            replace_existing_draft: replaceDraft,
            refinement_mode: refinementMode,
          },
          idempotencyKey.trim() || undefined,
        ),
      (data) => {
        setProgramme(data);
        setProgrammeId(data.programme_id);
        setSelectedPhase(data.programme.phases[0]?.phase_number ?? 1);
        setNotice({
          tone: 'success',
          title: 'Programme generated',
          message: `${data.programme.programme.name} was saved as version ${data.version}.`,
        });
      },
    );
  };

  const loadCurrent = () => {
    if (!requireToken()) return;
    void run('current', () => odinApi.currentProgramme(token.trim()), (data) => {
      setProgramme(data);
      setProgrammeId(data.programme_id);
      setSelectedPhase(data.programme.phases[0]?.phase_number ?? 1);
      setNotice({
        tone: 'success',
        title: 'Current draft loaded',
        message: `Loaded programme version ${data.version}.`,
      });
    });
  };

  const lookupProgramme = () => {
    if (!requireToken()) return;
    if (!programmeId.trim()) {
      setNotice({
        tone: 'info',
        title: 'Programme ID required',
        message: 'Enter a programme UUID to retrieve it.',
      });
      return;
    }
    void run(
      'lookup',
      () => odinApi.programmeById(token.trim(), programmeId.trim()),
      (data) => {
        setProgramme(data);
        setSelectedPhase(data.programme.phases[0]?.phase_number ?? 1);
        setNotice({
          tone: 'success',
          title: 'Programme loaded',
          message: `Loaded ${data.programme.programme.name}.`,
        });
      },
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Odin Programme Studio">
          <span className="brand-mark">
            <Dumbbell size={20} />
          </span>
          <span>
            <strong>ODIN</strong>
            <small>Programme Studio</small>
          </span>
        </a>
        <nav>
          <a href="#athlete">Athlete</a>
          <a href="#generate">Generate</a>
          <a href="#programme">Programme</a>
        </nav>
        <button
          className={`health-chip health-${health.status}`}
          onClick={() => void checkHealth()}
          disabled={busy === 'health'}
        >
          {busy === 'health' ? (
            <Loader2 size={14} className="spin" />
          ) : (
            <span className="health-dot" />
          )}
          API {health.status}
          {health.version ? ` · v${health.version}` : ''}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow">
            <Sparkles size={14} /> Deterministic programme planning
          </div>
          <h1>
            Build with precision.
            <span>Train with intent.</span>
          </h1>
          <p>
            A focused interface for Odin’s public API—from athlete profile to a
            validated, exercise-level training programme.
          </p>
          <div className="hero-steps">
            <span><b>01</b> Connect</span>
            <ArrowRight size={16} />
            <span><b>02</b> Profile</span>
            <ArrowRight size={16} />
            <span><b>03</b> Generate</span>
            <ArrowRight size={16} />
            <span><b>04</b> Review</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="section-icon"><KeyRound size={20} /></div>
          {sessionEmail ? (
            <>
              <div className="auth-copy">
                <strong>Connected to Supabase</strong>
                <span>{sessionEmail}</span>
              </div>
              <StatusPill tone="positive">
                <Check size={13} /> Authenticated
              </StatusPill>
              <Button
                variant="secondary"
                onClick={signOut}
                busy={busy === 'auth'}
              >
                <LogOut size={15} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <div className="auth-copy">
                <strong>Sign in to Supabase</strong>
                <span>Use a development test user. Session managed by Supabase.</span>
              </div>
              <div className="auth-fields">
                <label>
                  <Mail size={15} />
                  <input
                    aria-label="Supabase email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="test@example.com"
                    autoComplete="username"
                  />
                </label>
                <label>
                  <LockKeyhole size={15} />
                  <input
                    aria-label="Supabase password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') signIn();
                    }}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </label>
              </div>
              <Button onClick={signIn} busy={busy === 'auth'}>
                <LogIn size={15} /> Sign in
              </Button>
            </>
          )}
          {!isSupabaseAuthConfigured ? (
            <div className="auth-config-warning">
              <AlertCircle size={15} />
              Add Supabase URL and anon key to <code>demo-ui/.env.local</code>.
            </div>
          ) : null}
        </section>

        {notice ? (
          <section className={`notice notice-${notice.tone}`}>
            {notice.tone === 'success' ? (
              <Check size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <div>
              <strong>{notice.title}</strong>
              <span>{notice.message}</span>
              {notice.details ? (
                <details>
                  <summary>Validation details</summary>
                  <pre>{JSON.stringify(notice.details, null, 2)}</pre>
                </details>
              ) : null}
            </div>
            <button onClick={() => setNotice(null)} aria-label="Dismiss message">
              ×
            </button>
          </section>
        ) : null}

        <section className="workspace-grid">
          <div className="main-column">
            <section className="panel" id="athlete">
              <div className="panel-heading">
                <div>
                  <span className="section-number">01</span>
                  <div>
                    <h2>Athlete profile</h2>
                    <p>Inputs match the current public profile contract.</p>
                  </div>
                </div>
                <StatusPill
                  tone={
                    profileLoad.status === 'loaded'
                      ? 'positive'
                      : profileLoad.status === 'error'
                        ? 'negative'
                        : 'neutral'
                  }
                >
                  {profileLoad.status === 'loading' ? (
                    <Loader2 size={13} className="spin" />
                  ) : profileLoad.status === 'loaded' ? (
                    <Database size={13} />
                  ) : (
                    <UserRound size={13} />
                  )}
                  {profileLoad.status === 'loaded'
                    ? 'Loaded from DB'
                    : profileLoad.status === 'not_found'
                      ? 'New profile'
                      : profileLoad.status === 'error'
                        ? 'Load failed'
                        : profileLoad.status === 'loading'
                          ? 'Loading'
                          : 'Required'}
                </StatusPill>
              </div>

              <div className="form-grid">
                <Field label="Name">
                  <input
                    value={profile.name}
                    onChange={(event) => updateProfile('name', event.target.value)}
                  />
                </Field>
                <Field label="Age">
                  <input
                    type="number"
                    min={16}
                    max={100}
                    value={profile.age}
                    onChange={(event) =>
                      updateProfile('age', Number(event.target.value))
                    }
                  />
                </Field>
                <Field label="Sex">
                  <select
                    value={profile.sex}
                    onChange={(event) =>
                      updateProfile('sex', event.target.value as AthleteInput['sex'])
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Fitness level">
                  <select
                    value={profile.fitness_level}
                    onChange={(event) =>
                      updateProfile(
                        'fitness_level',
                        event.target.value as AthleteInput['fitness_level'],
                      )
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>
                <Field label="Current weight" hint="Kilograms">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={profile.current_weight_kg}
                    onChange={(event) =>
                      updateProfile(
                        'current_weight_kg',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Target weight" hint="Kilograms">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={profile.target_weight_kg}
                    onChange={(event) =>
                      updateProfile(
                        'target_weight_kg',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Height" hint="Centimetres">
                  <input
                    type="number"
                    min="1"
                    value={profile.height_cm}
                    onChange={(event) =>
                      updateProfile('height_cm', Number(event.target.value))
                    }
                  />
                </Field>
                <Field label="Goal">
                  <select
                    value={profile.goal}
                    onChange={(event) =>
                      updateProfile(
                        'goal',
                        event.target.value as AthleteInput['goal'],
                      )
                    }
                  >
                    {[
                      'fat_loss',
                      'muscle_gain',
                      'recomposition',
                      'strength',
                      'endurance',
                    ].map((goal) => (
                      <option key={goal} value={goal}>{labelize(goal)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Training days" hint="2–7 days per week">
                  <input
                    type="number"
                    min={2}
                    max={7}
                    value={profile.available_days_per_week}
                    onChange={(event) =>
                      updateProfile(
                        'available_days_per_week',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Session duration" hint="20–180 minutes">
                  <input
                    type="number"
                    min={20}
                    max={180}
                    value={profile.session_duration_min}
                    onChange={(event) =>
                      updateProfile(
                        'session_duration_min',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Equipment">
                  <select
                    value={profile.equipment}
                    onChange={(event) =>
                      updateProfile(
                        'equipment',
                        event.target.value as AthleteInput['equipment'],
                      )
                    }
                  >
                    {[
                      'full_gym',
                      'dumbbells_only',
                      'bodyweight',
                      'home_gym',
                    ].map((equipment) => (
                      <option key={equipment} value={equipment}>
                        {labelize(equipment)}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="field span-2">
                  <span className="field-label">Injuries and restrictions</span>
                  <div className="injury-row">
                    <input
                      aria-label="Injury area"
                      value={profile.injuries[0]?.area ?? ''}
                      onChange={(event) => {
                        const area = event.target.value;
                        updateProfile(
                          'injuries',
                          area
                            ? [{
                                area,
                                severity: profile.injuries[0]?.severity ?? 'modify',
                                notes: profile.injuries[0]?.notes ?? '',
                              }]
                            : [],
                        );
                      }}
                      placeholder="Optional area, e.g. shoulder"
                    />
                    <select
                      aria-label="Injury severity"
                      value={profile.injuries[0]?.severity ?? 'modify'}
                      disabled={!profile.injuries[0]}
                      onChange={(event) => {
                        if (!profile.injuries[0]) return;
                        updateProfile('injuries', [{
                          ...profile.injuries[0],
                          severity: event.target.value as 'avoid' | 'modify',
                        }]);
                      }}
                    >
                      <option value="modify">Modify</option>
                      <option value="avoid">Avoid</option>
                    </select>
                    <input
                      aria-label="Injury notes"
                      value={profile.injuries[0]?.notes ?? ''}
                      disabled={!profile.injuries[0]}
                      onChange={(event) => {
                        if (!profile.injuries[0]) return;
                        updateProfile('injuries', [{
                          ...profile.injuries[0],
                          notes: event.target.value,
                        }]);
                      }}
                      placeholder="Optional notes"
                    />
                  </div>
                  <span className="field-hint">
                    Demo supports one visible restriction; the API accepts an array.
                  </span>
                </div>
              </div>

              <div className="panel-actions">
                <span>
                  <ShieldCheck size={16} />
                  {profileLoad.status === 'loaded'
                    ? `Loaded through user-scoped RLS${
                        profileLoad.updatedAt
                          ? ` · ${new Date(profileLoad.updatedAt).toLocaleString()}`
                          : ''
                      }`
                    : 'User ID comes from the verified token'}
                </span>
                <div className="profile-actions">
                  <Button
                    variant="secondary"
                    onClick={() => void loadAuthenticatedProfile(true)}
                    busy={busy === 'profile-load'}
                    disabled={!token}
                  >
                    <RefreshCw size={16} /> Reload profile
                  </Button>
                  <Button onClick={saveProfile} busy={busy === 'profile'}>
                    <Save size={16} /> Save profile
                  </Button>
                </div>
              </div>
            </section>

            <section className="panel" id="generate">
              <div className="panel-heading">
                <div>
                  <span className="section-number">02</span>
                  <div>
                    <h2>Generate programme</h2>
                    <p>Choose the deterministic baseline or bounded refinement.</p>
                  </div>
                </div>
                <StatusPill tone="purple"><Bot size={13} /> Odin</StatusPill>
              </div>

              <div className="mode-grid">
                {([
                  ['deterministic', 'Baseline', 'Planner and validator only.'],
                  ['llm_optional', 'Optional refine', 'Falls back safely if unavailable.'],
                  ['llm_required', 'Required refine', 'Fails if refinement is unavailable.'],
                ] as const).map(([value, title, description]) => (
                  <label
                    key={value}
                    className={`mode-card ${refinementMode === value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="refinement"
                      value={value}
                      checked={refinementMode === value}
                      onChange={() => setRefinementMode(value)}
                    />
                    <span className="radio-mark" />
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </label>
                ))}
              </div>

              <div className="generation-options">
                <label className="check-control">
                  <input
                    type="checkbox"
                    checked={replaceDraft}
                    onChange={(event) => setReplaceDraft(event.target.checked)}
                  />
                  <span><Check size={12} /></span>
                  Replace existing draft
                </label>
                <Field label="Idempotency key" hint="Optional; safe retry identifier">
                  <input
                    value={idempotencyKey}
                    onChange={(event) => setIdempotencyKey(event.target.value)}
                    placeholder="demo-generation-001"
                  />
                </Field>
                <Button onClick={generate} busy={busy === 'generate'}>
                  <Sparkles size={16} /> Generate programme
                </Button>
              </div>
            </section>

            <section className="panel programme-panel" id="programme">
              <div className="panel-heading programme-heading">
                <div>
                  <span className="section-number">03</span>
                  <div>
                    <h2>Programme review</h2>
                    <p>Inspect saved output, validation, and refinement metadata.</p>
                  </div>
                </div>
                <div className="programme-fetch">
                  <Button
                    variant="secondary"
                    onClick={loadCurrent}
                    busy={busy === 'current'}
                  >
                    <RefreshCw size={15} /> Current draft
                  </Button>
                </div>
              </div>

              <div className="id-lookup">
                <Fingerprint size={17} />
                <input
                  aria-label="Programme UUID"
                  value={programmeId}
                  onChange={(event) => setProgrammeId(event.target.value)}
                  placeholder="Programme UUID"
                />
                <Button
                  variant="ghost"
                  onClick={lookupProgramme}
                  busy={busy === 'lookup'}
                >
                  <Search size={15} /> Find
                </Button>
              </div>

              {programme ? (
                <div className="programme-result">
                  <div className="programme-overview">
                    <div>
                      <div className="eyebrow">Version {programme.version}</div>
                      <h3>{programme.programme.programme.name}</h3>
                      <p>{programme.programme.programme.goal_description}</p>
                      <div className="overview-pills">
                        <StatusPill tone="positive">{labelize(programme.status)}</StatusPill>
                        <StatusPill tone="purple">{labelize(programme.source)}</StatusPill>
                        <StatusPill>{programme.programme.programme.target_weeks} weeks</StatusPill>
                        <StatusPill>{programme.programme.programme.available_days} days</StatusPill>
                      </div>
                    </div>
                    <ScoreRing score={programme.validation.overall_score} />
                  </div>

                  <div className="phase-tabs">
                    {programme.programme.phases.map((phase) => (
                      <button
                        key={phase.phase_number}
                        className={selectedPhase === phase.phase_number ? 'active' : ''}
                        onClick={() => setSelectedPhase(phase.phase_number)}
                      >
                        <span>Phase {phase.phase_number}</span>
                        <strong>{phase.name}</strong>
                        <small>{phase.weeks_count} weeks</small>
                      </button>
                    ))}
                  </div>

                  <div className="workout-list">
                    {activeDays.map((day) => (
                      <WorkoutDay key={day.day_of_week} day={day} />
                    ))}
                  </div>

                  <div className="validation-grid">
                    <div className="validation-card">
                      <div className="card-title">
                        <FileCheck2 size={18} />
                        <strong>Validation report</strong>
                        <StatusPill
                          tone={programme.validation.passed ? 'positive' : 'negative'}
                        >
                          {labelize(programme.validation.status)}
                        </StatusPill>
                      </div>
                      <div className="score-bars">
                        {Object.entries(programme.validation.scores).map(
                          ([name, score]) => (
                            <div key={name}>
                              <span>{labelize(name)}</span>
                              <i><b style={{ width: `${score}%` }} /></i>
                              <strong>{Math.round(score)}</strong>
                            </div>
                          ),
                        )}
                      </div>
                      {programme.validation.findings.length ? (
                        <div className="findings">
                          {programme.validation.findings.map((finding, index) => (
                            <div key={`${finding.code}-${index}`}>
                              <AlertCircle size={14} />
                              <span><strong>{finding.code}</strong>{finding.message}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-note"><Check size={15} /> No validation findings.</p>
                      )}
                    </div>

                    <div className="validation-card">
                      <div className="card-title">
                        <Bot size={18} />
                        <strong>Refinement</strong>
                        <StatusPill tone="purple">
                          {labelize(programme.refinement.status)}
                        </StatusPill>
                      </div>
                      <dl className="metadata-list">
                        <div><dt>Requested</dt><dd>{programme.refinement.requested ? 'Yes' : 'No'}</dd></div>
                        <div><dt>Applied</dt><dd>{programme.refinement.applied ? 'Yes' : 'No'}</dd></div>
                        <div><dt>Model</dt><dd>{programme.refinement.model ?? '—'}</dd></div>
                        <div><dt>Reason</dt><dd>{programme.refinement.reason_code ?? '—'}</dd></div>
                        <div><dt>Prompt</dt><dd>{programme.refinement.prompt_version ?? '—'}</dd></div>
                        <div><dt>Operations</dt><dd>{programme.refinement.accepted_operation_count ?? 0} accepted</dd></div>
                      </dl>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-programme">
                  <div className="empty-orbit"><Activity size={28} /></div>
                  <h3>No programme loaded</h3>
                  <p>Generate a new draft or retrieve the authenticated user’s current draft.</p>
                  <Button variant="secondary" onClick={loadCurrent} busy={busy === 'current'}>
                    <RefreshCw size={15} /> Load current draft
                  </Button>
                </div>
              )}
            </section>
          </div>

          <aside className="side-column">
            <div className="side-card sticky-card">
              <div className="side-card-heading">
                <CircleDashed size={18} />
                <strong>Workflow</strong>
              </div>
              <ol className="workflow-list">
                <li className={token.trim() ? 'done' : 'active'}>
                  <span>{token.trim() ? <Check size={13} /> : '1'}</span>
                  <div><strong>Connect</strong><small>Sign in to Supabase</small></div>
                </li>
                <li>
                  <span>2</span>
                  <div><strong>Save profile</strong><small>PUT /api/profile</small></div>
                </li>
                <li>
                  <span>3</span>
                  <div><strong>Generate</strong><small>POST /api/odin/generate</small></div>
                </li>
                <li className={programme ? 'done' : ''}>
                  <span>{programme ? <Check size={13} /> : '4'}</span>
                  <div><strong>Review</strong><small>Validated programme</small></div>
                </li>
              </ol>
            </div>

            <div className="side-card">
              <div className="side-card-heading">
                <HeartPulse size={18} />
                <strong>API surface</strong>
              </div>
              <ul className="endpoint-list">
                <li><code>GET</code><span>/api/health</span></li>
                <li><code>PUT</code><span>/api/profile</span></li>
                <li><code>POST</code><span>/api/odin/generate</span></li>
                <li><code>GET</code><span>/api/programmes/current</span></li>
                <li><code>GET</code><span>/api/programmes/:id</span></li>
              </ul>
            </div>

            <div className="side-card planned-card">
              <div className="side-card-heading">
                <Clock3 size={18} />
                <strong>Planned capabilities</strong>
              </div>
              <p>Visible for product context only. No backend contracts are assumed.</p>
              <button disabled><Play size={15} /> Activate programme <span>Planned</span></button>
              <button disabled><Dumbbell size={15} /> Start workout <span>Planned</span></button>
              <button disabled><Activity size={15} /> Log performance <span>Planned</span></button>
            </div>
          </aside>
        </section>
      </main>

      <footer>
        <div className="brand compact">
          <span className="brand-mark"><Dumbbell size={16} /></span>
          <span><strong>ODIN</strong><small>Demo UI</small></span>
        </div>
        <p>Standalone interface · Existing public contracts only · GymX unchanged</p>
      </footer>
    </div>
  );
}

export default App;
