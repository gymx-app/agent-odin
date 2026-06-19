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
  ShieldCheck,
  Sparkles,
  Database,
  UserRound,
} from 'lucide-react';
import { ApiError, odinApi } from './api/client';
import type {
  AthleteInput,
  ProgrammeDay,
  ProgrammePreviewResponse,
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
  | 'preview'
  | null;

type WorkflowStep = 'connect' | 'preview' | 'review';

type ProfileLoadState =
  | { status: 'default' }
  | { status: 'loading' }
  | {
      status: 'loaded';
      updatedAt: string | null;
      assumptions: string[];
    }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

type GymXUserProfile = {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  fitness_level: string | null;
  updated_at: string | null;
};

const labelize = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const ageFromDateOfBirth = (dateOfBirth: string): number => {
  const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate());

  if (beforeBirthday) age -= 1;
  return age;
};

const mapGymXProfile = (
  source: GymXUserProfile,
): { profile: AthleteInput; assumptions: string[] } => {
  const assumptions: string[] = [];
  const name =
    source.full_name?.trim() ||
    [source.first_name, source.last_name].filter(Boolean).join(' ').trim() ||
    defaultProfile.name;
  const age =
    source.age ??
    (source.date_of_birth
      ? ageFromDateOfBirth(source.date_of_birth)
      : defaultProfile.age);
  const sex =
    source.gender === 'male' || source.gender === 'female'
      ? source.gender
      : defaultProfile.sex;
  const fitnessLevel =
    source.fitness_level === 'beginner' ||
    source.fitness_level === 'intermediate' ||
    source.fitness_level === 'advanced'
      ? source.fitness_level
      : defaultProfile.fitness_level;

  if (!source.full_name && !source.first_name && !source.last_name)
    assumptions.push('Name uses the demo default.');
  if (source.age === null && !source.date_of_birth)
    assumptions.push('Age uses the demo default.');
  if (source.gender !== 'male' && source.gender !== 'female')
    assumptions.push('Sex uses the demo default because GymX has no binary value.');
  if (!source.current_weight_kg)
    assumptions.push('Current weight uses the demo default.');
  if (!source.target_weight_kg)
    assumptions.push('Target weight uses the demo default.');
  if (!source.height_cm) assumptions.push('Height uses the demo default.');
  if (fitnessLevel === defaultProfile.fitness_level && source.fitness_level !== fitnessLevel)
    assumptions.push('Fitness level uses the demo default.');
  assumptions.push(
    'Goal, availability, session duration, equipment, injuries, and InBody remain demo defaults because GymX user_profiles does not store those Odin fields.',
  );

  return {
    profile: {
      ...defaultProfile,
      name,
      age,
      sex,
      current_weight_kg:
        source.current_weight_kg ?? defaultProfile.current_weight_kg,
      target_weight_kg:
        source.target_weight_kg ?? defaultProfile.target_weight_kg,
      height_cm: source.height_cm ?? defaultProfile.height_cm,
      fitness_level: fitnessLevel,
    },
    assumptions,
  };
};

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
    type={props.type ?? 'button'}
    className={`button button-${variant} ${props.className ?? ''}`}
    aria-busy={busy || undefined}
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
  const [programme, setProgramme] =
    useState<ProgrammePreviewResponse | null>(null);
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

  const workflowStep: WorkflowStep = !token.trim()
    ? 'connect'
    : !programme
      ? 'preview'
      : 'review';

  const isBusy = busy !== null;

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

  const checkHealth = async () => {
    setBusy('health');
    setNotice(null);
    try {
      const data = await odinApi.health();
      setHealth({ status: 'online', version: data.version });
      setNotice({
        tone: 'success',
        title: 'API connected',
        message: `Agent Odin ${data.version} is healthy.`,
      });
    } catch (error) {
      setHealth({ status: 'offline' });
      setNotice(errorNotice(error));
    } finally {
      setBusy(null);
    }
  };

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
        .from('user_profiles')
        .select(
          'full_name,first_name,last_name,age,date_of_birth,gender,height_cm,current_weight_kg,target_weight_kg,fitness_level,updated_at',
        )
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
              'Authentication succeeded, but this user has no GymX user_profiles row. The form remains on demo defaults.',
          });
        }
        return;
      }

      const mapped = mapGymXProfile(data as GymXUserProfile);
      const parsed = athleteInputSchema.safeParse(mapped.profile);

      if (!parsed.success) {
        throw new Error(
          'The mapped GymX profile does not match the current Odin profile schema.',
        );
      }

      setProfile(parsed.data);
      setProfileLoad({
        status: 'loaded',
        updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
        assumptions: mapped.assumptions,
      });
      if (showNotice) {
        setNotice({
          tone: 'success',
          title: 'GymX profile loaded',
          message:
            'Supabase authentication is valid. Compatible fields from this user’s GymX profile populated the Odin form.',
          details: {
            mapping_assumptions: mapped.assumptions,
          },
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
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const generatePreview = () => {
    if (!requireToken()) return;
    const parsed = athleteInputSchema.safeParse(profile);
    if (!parsed.success) {
      setNotice({
        tone: 'error',
        title: 'PROFILE_VALIDATION_FAILED',
        message:
          'Review the validation details and correct the profile before generating a preview.',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    void run(
      'preview',
      () => odinApi.preview(token.trim(), parsed.data, refinementMode),
      (data) => {
        setProgramme(data);
        setSelectedPhase(data.programme.phases[0]?.phase_number ?? 1);
        setNotice({
          tone: 'success',
          title: 'Programme preview generated',
          message: `${data.programme.programme.name} is ready to review. Nothing was persisted.`,
        });
        document
          .querySelector('#programme')
          ?.scrollIntoView({ behavior: 'smooth' });
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
          <a href="#generate">Preview</a>
          <a href="#programme">Programme</a>
        </nav>
        <button
          className={`health-chip health-${health.status}`}
          onClick={() => void checkHealth()}
          disabled={isBusy}
          aria-label={`API ${health.status}${
            health.version ? `, version ${health.version}` : ''
          }. Check health`}
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
            A focused interface for Odin’s authenticated API—from transient
            athlete input to a validated, exercise-level programme preview.
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

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="section-icon"><KeyRound size={20} /></div>
          {sessionEmail ? (
            <>
              <div className="auth-copy">
                <strong id="auth-title">Connected to Supabase</strong>
                <span>{sessionEmail}</span>
              </div>
              <StatusPill tone="positive">
                <Check size={13} /> Authenticated
              </StatusPill>
              <Button
                variant="secondary"
                onClick={signOut}
                busy={busy === 'auth'}
                disabled={isBusy}
              >
                <LogOut size={15} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <div className="auth-copy">
                <strong id="auth-title">Sign in to Supabase</strong>
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
              <Button onClick={signIn} busy={busy === 'auth'} disabled={isBusy}>
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
          <section
            className={`notice notice-${notice.tone}`}
            role={notice.tone === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
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
                    <p>Inputs match the current transient athlete contract.</p>
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
                    ? 'Loaded from GymX'
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
                    aria-label="Athlete name"
                    value={profile.name}
                    onChange={(event) => updateProfile('name', event.target.value)}
                  />
                </Field>
                <Field label="Age">
                  <input
                    aria-label="Athlete age"
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
                    aria-label="Athlete sex"
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
                    aria-label="Fitness level"
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
                    aria-label="Current weight in kilograms"
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
                    aria-label="Target weight in kilograms"
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
                    aria-label="Height in centimetres"
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
                    aria-label="Training goal"
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
                    aria-label="Available training days per week"
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
                    aria-label="Session duration in minutes"
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
                    aria-label="Available equipment"
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
                    ? `Mapped from GymX through user-scoped RLS${
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
                    disabled={!token || isBusy}
                  >
                    <RefreshCw size={16} /> Reload profile
                  </Button>
                </div>
              </div>
            </section>

            <section className="panel" id="generate">
              <div className="panel-heading">
                <div>
                  <span className="section-number">02</span>
                  <div>
                    <h2>Generate preview</h2>
                    <p>
                      Athlete input is sent transiently and is not persisted by Odin.
                    </p>
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

              <div className="preview-actions">
                <span>
                  <ShieldCheck size={16} />
                  Authenticated, stateless preview
                </span>
                <Button
                  onClick={generatePreview}
                  busy={busy === 'preview'}
                  disabled={isBusy}
                >
                  <Sparkles size={16} /> Generate preview
                </Button>
              </div>
            </section>

            <section className="panel programme-panel" id="programme">
              <div className="panel-heading programme-heading">
                <div>
                  <span className="section-number">03</span>
                  <div>
                    <h2>Programme review</h2>
                    <p>Inspect the transient output, validation, and refinement metadata.</p>
                  </div>
                </div>
              </div>

              {programme ? (
                <div className="programme-result">
                  <div className="programme-overview">
                    <div>
                      <div className="eyebrow">Stateless preview</div>
                      <h3>{programme.programme.programme.name}</h3>
                      <p>{programme.programme.programme.goal_description}</p>
                      <div className="overview-pills">
                        <StatusPill tone="positive">Validated</StatusPill>
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
                        type="button"
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
                  <h3>No preview generated</h3>
                  <p>
                    Configure the athlete and generate a validated, stateless programme preview.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={generatePreview}
                    busy={busy === 'preview'}
                    disabled={isBusy}
                  >
                    <Sparkles size={15} /> Generate preview
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
                <li className={token.trim() ? 'done' : ''}>
                  <span>{token.trim() ? <Check size={13} /> : '2'}</span>
                  <div><strong>Configure athlete</strong><small>Transient input</small></div>
                </li>
                <li className={workflowStep === 'preview' ? 'active' : programme ? 'done' : ''}>
                  <span>{programme ? <Check size={13} /> : '3'}</span>
                  <div><strong>Generate preview</strong><small>POST /api/odin/preview</small></div>
                </li>
                <li className={programme ? 'done' : workflowStep === 'review' ? 'active' : ''}>
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
                <li><code>POST</code><span>/api/odin/preview</span></li>
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
