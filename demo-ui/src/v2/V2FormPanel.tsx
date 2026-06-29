import { useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  FileUp,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { odinApi } from '../api/client';
import type {
  AthleteInputV2,
  GoalParametersV2,
  InBodyParseResult,
  ProgrammePreviewResponse,
} from '../api/contracts';
import type { StepProgress } from '../api/client';

// ── Local minimal Field/Button to avoid coupling to App.tsx internals ──────────

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

const Btn = ({
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

// ── Types ───────────────────────────────────────────────────────────────────────

type GoalKey = 'fat_loss' | 'muscle_gain' | 'strength' | 'recomposition' | 'endurance';

const GOAL_LABELS: Record<GoalKey, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  strength: 'Strength',
  recomposition: 'Recomposition',
  endurance: 'General Fitness',
};

const PRIMARY_LIFTS = [
  { value: 'squat', label: 'Squat' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'bench_press', label: 'Bench Press' },
  { value: 'overhead_press', label: 'Overhead Press' },
] as const;

const DAYS_V2 = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

type InBodyStatus = 'idle' | 'parsing' | 'success' | 'error' | 'manual';

type InBodyFields = {
  body_fat_pct: string;
  smm_kg: string;
  visceral_fat_area: string;
  bmr: string;
};

const emptyInBody = (): InBodyFields => ({
  body_fat_pct: '',
  smm_kg: '',
  visceral_fat_area: '',
  bmr: '',
});

// ── Props ───────────────────────────────────────────────────────────────────────

export type V2FormPanelProps = {
  token: string;
  disabled: boolean;
  onResult: (data: ProgrammePreviewResponse) => void;
  onProgress: (progress: StepProgress) => void;
  onError: (error: unknown) => void;
  onBusyChange: (busy: boolean) => void;
};

// ── Component ───────────────────────────────────────────────────────────────────

export function V2FormPanel({
  token,
  disabled,
  onResult,
  onProgress,
  onError,
  onBusyChange,
}: V2FormPanelProps) {
  // ── Base athlete fields ──
  const [name, setName] = useState('Alex Morgan');
  const [age, setAge] = useState(32);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [currentWeight, setCurrentWeight] = useState(84);
  const [targetWeight, setTargetWeight] = useState(79);
  const [heightCm, setHeightCm] = useState(180);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionMin, setSessionMin] = useState(60);
  const [equipment, setEquipment] = useState<AthleteInputV2['equipment']>('full_gym');
  const [fitnessLevel, setFitnessLevel] = useState<AthleteInputV2['fitness_level']>('intermediate');
  const [injuryArea, setInjuryArea] = useState('');
  const [injurySeverity, setInjurySeverity] = useState<'modify' | 'avoid'>('modify');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // ── Goal + goal-specific params ──
  const [goal, setGoal] = useState<GoalKey>('fat_loss');
  const [goalParams, setGoalParams] = useState<GoalParametersV2>({});

  const setParam = <K extends keyof GoalParametersV2>(key: K, val: GoalParametersV2[K]) =>
    setGoalParams((prev) => ({ ...prev, [key]: val }));

  const clearParam = <K extends keyof GoalParametersV2>(key: K) =>
    setGoalParams((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const numParam = (
    key: keyof GoalParametersV2,
    raw: string,
    min?: number,
    max?: number,
  ) => {
    if (!raw) { clearParam(key); return; }
    const n = Number(raw);
    if (isNaN(n)) return;
    if (min !== undefined && n < min) return;
    if (max !== undefined && n > max) return;
    setParam(key, n as never);
  };

  // ── InBody upload state ──
  const [inbodyStatus, setInbodyStatus] = useState<InBodyStatus>('idle');
  const [parsed, setParsed] = useState<InBodyParseResult | null>(null);
  const [overrides, setOverrides] = useState<InBodyFields>(emptyInBody());
  const [manual, setManual] = useState<InBodyFields>(emptyInBody());
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Generating state ──
  const [generating, setGenerating] = useState(false);

  // ── InBody helpers ──

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    const mediaType = file.type === 'application/pdf'
      ? 'application/pdf'
      : file.type === 'image/png'
        ? 'image/png'
        : 'image/jpeg';

    setInbodyStatus('parsing');
    setParseError(null);

    try {
      const b64 = await toBase64(file);
      const result = await odinApi.parseInBody(token, b64, mediaType);
      setParsed(result);
      setOverrides({
        body_fat_pct: result.body_fat_pct?.toString() ?? '',
        smm_kg: result.smm_kg?.toString() ?? '',
        visceral_fat_area: result.visceral_fat_area?.toString() ?? '',
        bmr: result.bmr?.toString() ?? '',
      });
      setInbodyStatus('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Parse failed';
      setParseError(msg);
      setInbodyStatus('error');
    }
  };

  const effectiveInBody = (): AthleteInputV2['inbody'] => {
    if (inbodyStatus === 'success') {
      const bfp = parseFloat(overrides.body_fat_pct);
      const smm = parseFloat(overrides.smm_kg);
      const vfa = parseFloat(overrides.visceral_fat_area);
      const bmr = parseFloat(overrides.bmr);
      if (isNaN(bfp) || isNaN(smm) || isNaN(vfa) || isNaN(bmr)) return null;
      return { body_fat_pct: bfp, smm_kg: smm, visceral_fat_area: vfa, bmr };
    }
    if (inbodyStatus === 'manual') {
      const bfp = parseFloat(manual.body_fat_pct);
      const smm = parseFloat(manual.smm_kg);
      const vfa = parseFloat(manual.visceral_fat_area);
      const bmr = parseFloat(manual.bmr);
      if (isNaN(bfp) || isNaN(smm) || isNaN(vfa) || isNaN(bmr)) return null;
      return { body_fat_pct: bfp, smm_kg: smm, visceral_fat_area: vfa, bmr };
    }
    return null;
  };

  // ── Build payload and generate ──

  const handleGenerate = async () => {
    if (!token) return;

    const inbody = effectiveInBody();
    const cleanGoalParams: GoalParametersV2 = { ...goalParams };

    // If InBody gave us current BF%, let it overwrite goal_parameters.current_body_fat_pct
    if (inbody?.body_fat_pct != null && !cleanGoalParams.current_body_fat_pct) {
      cleanGoalParams.current_body_fat_pct = inbody.body_fat_pct;
    }

    const hasGoalParams = Object.keys(cleanGoalParams).some(
      (k) => cleanGoalParams[k as keyof GoalParametersV2] !== undefined,
    );

    const athlete: AthleteInputV2 = {
      name: name.trim() || 'Athlete',
      age,
      sex,
      current_weight_kg: currentWeight,
      target_weight_kg: targetWeight,
      height_cm: heightCm,
      goal,
      available_days_per_week: selectedDays.length || daysPerWeek,
      session_duration_min: sessionMin,
      equipment,
      fitness_level: fitnessLevel,
      injuries: injuryArea.trim()
        ? [{ area: injuryArea.trim(), severity: injurySeverity, notes: '' }]
        : [],
      inbody,
      ...(hasGoalParams ? { goal_parameters: cleanGoalParams } : {}),
      ...(selectedDays.length
        ? {
            schedule: {
              available_days: selectedDays as AthleteInputV2['schedule'] extends { available_days?: (infer D)[] | undefined } ? D[] : never,
            },
          }
        : {}),
    };

    setGenerating(true);
    onBusyChange(true);
    try {
      const result = await odinApi.generateProgrammeV2(token, athlete, onProgress);
      onResult(result);
    } catch (err) {
      onError(err);
    } finally {
      setGenerating(false);
      onBusyChange(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="v2-form">

      {/* ── Goal selector (first per spec) ── */}
      <div className="v2-section-label">Goal</div>
      <div className="v2-goal-tabs">
        {(Object.entries(GOAL_LABELS) as [GoalKey, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`v2-goal-tab ${goal === key ? 'active' : ''}`}
            onClick={() => { setGoal(key); setGoalParams({}); }}
            disabled={disabled || generating}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Goal-specific optional fields ── */}
      <div className="v2-goal-fields">
        {(goal === 'fat_loss' || goal === 'recomposition') && (
          <>
            <Field label="Current body fat %" hint="Optional — overridden by InBody scan if provided">
              <input
                type="number" min={1} max={60} step={0.1}
                value={goalParams.current_body_fat_pct ?? ''}
                onChange={(e) => numParam('current_body_fat_pct', e.target.value, 1, 60)}
                placeholder="e.g. 24.5"
                disabled={disabled || generating}
              />
            </Field>
            <Field label="Target body fat %" hint="Optional">
              <input
                type="number" min={5} max={50} step={0.1}
                value={goalParams.target_body_fat_pct ?? ''}
                onChange={(e) => numParam('target_body_fat_pct', e.target.value, 5, 50)}
                placeholder="e.g. 18.0"
                disabled={disabled || generating}
              />
            </Field>
          </>
        )}
        {(goal === 'muscle_gain' || goal === 'recomposition') && (
          <Field label="Target muscle gain" hint="Kilograms — optional">
            <input
              type="number" min={0.5} max={20} step={0.5}
              value={goalParams.target_muscle_gain_kg ?? ''}
              onChange={(e) => numParam('target_muscle_gain_kg', e.target.value, 0.5, 20)}
              placeholder="e.g. 5"
              disabled={disabled || generating}
            />
          </Field>
        )}
        {goal === 'strength' && (
          <>
            <Field label="Primary lift">
              <select
                value={goalParams.primary_lift ?? ''}
                onChange={(e) =>
                  e.target.value
                    ? setParam('primary_lift', e.target.value as GoalParametersV2['primary_lift'])
                    : clearParam('primary_lift')
                }
                disabled={disabled || generating}
              >
                <option value="">Not specified</option>
                {PRIMARY_LIFTS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Current 1RM" hint="Kilograms — optional">
              <input
                type="number" min={1} max={500} step={2.5}
                value={goalParams.current_1rm_kg ?? ''}
                onChange={(e) => numParam('current_1rm_kg', e.target.value, 1, 500)}
                placeholder="e.g. 120"
                disabled={disabled || generating}
              />
            </Field>
            <Field label="Target 1RM" hint="Kilograms — optional">
              <input
                type="number" min={1} max={500} step={2.5}
                value={goalParams.target_1rm_kg ?? ''}
                onChange={(e) => numParam('target_1rm_kg', e.target.value, 1, 500)}
                placeholder="e.g. 140"
                disabled={disabled || generating}
              />
            </Field>
          </>
        )}
        {goal === 'endurance' && (
          <Field label="Focus">
            <select
              value={goalParams.endurance_focus ?? ''}
              onChange={(e) =>
                e.target.value
                  ? setParam('endurance_focus', e.target.value as GoalParametersV2['endurance_focus'])
                  : clearParam('endurance_focus')
              }
              disabled={disabled || generating}
            >
              <option value="">Not specified</option>
              <option value="cardio">Cardio</option>
              <option value="mobility">Mobility</option>
              <option value="general">Overall health</option>
            </select>
          </Field>
        )}
        {/* Timeframe shown for all goals */}
        <Field label="Timeframe" hint="Weeks — optional">
          <input
            type="number" min={4} max={52}
            value={goalParams.timeframe_weeks ?? ''}
            onChange={(e) => numParam('timeframe_weeks', e.target.value, 4, 52)}
            placeholder="e.g. 12"
            disabled={disabled || generating}
          />
        </Field>
      </div>

      {/* ── InBody upload ── */}
      <div className="v2-section-label">InBody scan</div>
      <div className="v2-inbody-section">

        {inbodyStatus === 'idle' && (
          <div className="v2-inbody-idle">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
            <Btn
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={!token || disabled || generating}
            >
              <FileUp size={15} /> Upload InBody scan
            </Btn>
            <button
              type="button"
              className="v2-skip-link"
              onClick={() => setInbodyStatus('manual')}
              disabled={disabled || generating}
            >
              Skip — enter values manually
            </button>
            <span className="field-hint">PDF, JPG or PNG · Sent to Claude for extraction</span>
          </div>
        )}

        {inbodyStatus === 'parsing' && (
          <div className="v2-inbody-parsing">
            <Loader2 size={18} className="spin" />
            <span>Reading InBody scan…</span>
          </div>
        )}

        {inbodyStatus === 'success' && parsed && (
          <div className="v2-inbody-success">
            <div className="v2-inbody-card-header">
              <Check size={16} /> InBody extracted — edit any field to override
              <button
                type="button"
                className="v2-inbody-clear"
                onClick={() => { setInbodyStatus('idle'); setParsed(null); setOverrides(emptyInBody()); }}
                aria-label="Remove InBody data"
              >
                <X size={14} />
              </button>
            </div>
            <div className="form-grid">
              <Field label="Body fat %" hint="From scan">
                <input
                  type="number" step={0.1}
                  value={overrides.body_fat_pct}
                  onChange={(e) => setOverrides((o) => ({ ...o, body_fat_pct: e.target.value }))}
                  disabled={disabled || generating}
                />
              </Field>
              <Field label="Skeletal muscle mass" hint="kg">
                <input
                  type="number" step={0.1}
                  value={overrides.smm_kg}
                  onChange={(e) => setOverrides((o) => ({ ...o, smm_kg: e.target.value }))}
                  disabled={disabled || generating}
                />
              </Field>
              <Field label="Visceral fat area" hint="cm²">
                <input
                  type="number" step={1}
                  value={overrides.visceral_fat_area}
                  onChange={(e) => setOverrides((o) => ({ ...o, visceral_fat_area: e.target.value }))}
                  disabled={disabled || generating}
                />
              </Field>
              <Field label="BMR" hint="kcal/day">
                <input
                  type="number" step={1}
                  value={overrides.bmr}
                  onChange={(e) => setOverrides((o) => ({ ...o, bmr: e.target.value }))}
                  disabled={disabled || generating}
                />
              </Field>
            </div>
            {parsed.body_fat_mass_kg != null && (
              <div className="v2-inbody-extra">
                Body fat mass: {parsed.body_fat_mass_kg} kg
                {parsed.total_body_water_l != null ? ` · TBW: ${parsed.total_body_water_l} L` : ''}
              </div>
            )}
          </div>
        )}

        {inbodyStatus === 'error' && (
          <div className="v2-inbody-error">
            <AlertCircle size={16} /> {parseError ?? 'Parse failed'} — enter values manually below
            <button
              type="button"
              className="v2-skip-link"
              onClick={() => { setInbodyStatus('idle'); setParseError(null); }}
            >
              Try again
            </button>
          </div>
        )}

        {(inbodyStatus === 'error' || inbodyStatus === 'manual') && (
          <div className="v2-inbody-manual">
            <div className="v2-inbody-card-header">
              Manual InBody entry
              {inbodyStatus === 'manual' && (
                <button
                  type="button"
                  className="v2-inbody-clear"
                  onClick={() => { setInbodyStatus('idle'); setManual(emptyInBody()); }}
                  aria-label="Dismiss InBody"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="form-grid">
              <Field label="Body fat %" hint="Optional">
                <input
                  type="number" step={0.1} min={1} max={60}
                  value={manual.body_fat_pct}
                  onChange={(e) => setManual((m) => ({ ...m, body_fat_pct: e.target.value }))}
                  placeholder="e.g. 24.5"
                  disabled={disabled || generating}
                />
              </Field>
              <Field label="Skeletal muscle mass" hint="kg — optional">
                <input
                  type="number" step={0.1} min={10} max={80}
                  value={manual.smm_kg}
                  onChange={(e) => setManual((m) => ({ ...m, smm_kg: e.target.value }))}
                  placeholder="e.g. 32.0"
                  disabled={disabled || generating}
                />
              </Field>
              <Field label="Visceral fat area" hint="cm² — optional">
                <input
                  type="number" step={1} min={0} max={300}
                  value={manual.visceral_fat_area}
                  onChange={(e) => setManual((m) => ({ ...m, visceral_fat_area: e.target.value }))}
                  placeholder="e.g. 85"
                  disabled={disabled || generating}
                />
              </Field>
              <Field label="BMR" hint="kcal/day — optional">
                <input
                  type="number" step={1} min={500} max={5000}
                  value={manual.bmr}
                  onChange={(e) => setManual((m) => ({ ...m, bmr: e.target.value }))}
                  placeholder="e.g. 1680"
                  disabled={disabled || generating}
                />
              </Field>
            </div>
            <span className="field-hint">Leave all blank to omit InBody data from the programme.</span>
          </div>
        )}
      </div>

      {/* ── Base athlete fields ── */}
      <div className="v2-section-label">Athlete</div>
      <div className="form-grid">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled || generating}
          />
        </Field>
        <Field label="Age">
          <input
            type="number" min={16} max={100}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            disabled={disabled || generating}
          />
        </Field>
        <Field label="Sex">
          <select value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')} disabled={disabled || generating}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Fitness level">
          <select
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value as AthleteInputV2['fitness_level'])}
            disabled={disabled || generating}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Current weight" hint="kg">
          <input type="number" step={0.1} min={30} value={currentWeight} onChange={(e) => setCurrentWeight(Number(e.target.value))} disabled={disabled || generating} />
        </Field>
        <Field label="Target weight" hint="kg">
          <input type="number" step={0.1} min={30} value={targetWeight} onChange={(e) => setTargetWeight(Number(e.target.value))} disabled={disabled || generating} />
        </Field>
        <Field label="Height" hint="cm">
          <input type="number" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} disabled={disabled || generating} />
        </Field>
        <Field label="Training days" hint="2–7 days/week">
          <input
            type="number" min={2} max={7}
            value={selectedDays.length || daysPerWeek}
            onChange={(e) => { setDaysPerWeek(Number(e.target.value)); setSelectedDays([]); }}
            disabled={disabled || generating}
          />
        </Field>
        <Field label="Session duration" hint="20–180 min">
          <input type="number" min={20} max={180} value={sessionMin} onChange={(e) => setSessionMin(Number(e.target.value))} disabled={disabled || generating} />
        </Field>
        <Field label="Equipment">
          <select value={equipment} onChange={(e) => setEquipment(e.target.value as AthleteInputV2['equipment'])} disabled={disabled || generating}>
            <option value="full_gym">Full Gym</option>
            <option value="dumbbells_only">Dumbbells Only</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="home_gym">Home Gym</option>
          </select>
        </Field>
        <div className="field span-2">
          <span className="field-label">Available days</span>
          <div className="day-toggles">
            {DAYS_V2.map((day) => (
              <label key={day} className="day-toggle">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  disabled={disabled || generating}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
          <span className="field-hint">Selecting days auto-syncs the training days count.</span>
        </div>
        <div className="field span-2">
          <span className="field-label">Injury / restriction</span>
          <div className="injury-row">
            <input
              value={injuryArea}
              onChange={(e) => setInjuryArea(e.target.value)}
              placeholder="Optional area, e.g. shoulder"
              disabled={disabled || generating}
            />
            <select
              value={injurySeverity}
              onChange={(e) => setInjurySeverity(e.target.value as 'modify' | 'avoid')}
              disabled={!injuryArea || disabled || generating}
            >
              <option value="modify">Modify</option>
              <option value="avoid">Avoid</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Generate button ── */}
      <div className="preview-actions" style={{ marginTop: '1.5rem' }}>
        <span className="field-hint">
          Sends to <code>/api/v2/odin/generate-programme</code> · v2 prompt · goal parameters included
        </span>
        <Btn
          onClick={() => void handleGenerate()}
          busy={generating}
          disabled={!token || disabled || generating}
        >
          <Sparkles size={16} /> Generate v2 programme
        </Btn>
      </div>
    </div>
  );
}
