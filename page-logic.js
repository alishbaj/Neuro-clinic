const SYMPTOMS = [
  {id:'headache', label:'Headaches & migraine', title:'Headaches and migraine',
   blurb:'Most headache care goes wrong by treating attacks one at a time. We look at the whole pattern — triggers, sleep, medication overuse — and build a plan for both stopping attacks and having fewer of them.',
   bullets:['A timeline of your attacks and what you have already tried','Review of every medication, including the over-the-counter ones','Whether imaging is genuinely needed (usually it is not)','A written preventive and rescue plan, sent the same day']},
  {id:'seizure', label:'Seizures & epilepsy', title:'Seizures and epilepsy',
   blurb:'Follow-up epilepsy care translates well to video: medication levels, side effects, seizure diaries and driving questions rarely need an in-person exam.',
   bullets:['Seizure diary review, event by event','Medication dose, timing and side-effect check','Driving, work and safety guidance for your state','Coordination with your local EEG or lab if needed']},
  {id:'dizziness', label:'Dizziness & vertigo', title:'Dizziness and vertigo',
   blurb:'Vertigo has a short list of common causes, and most can be separated by history alone plus a few movements you can do on camera.',
   bullets:['Careful history: spinning, floating, or faint?','Guided eye and head-position tests over video','At-home repositioning manoeuvres, taught live','Clear criteria for when in-person testing is worth it']},
  {id:'memory', label:'Memory & cognition', title:'Memory and thinking changes',
   blurb:'We start with what changed, when, and who noticed. Bringing a family member into the call is encouraged — a second account is genuinely diagnostic.',
   bullets:['Structured cognitive screening on video','Medication and sleep review — both common culprits','Bloodwork ordered locally before the follow-up','An honest conversation about what comes next']},
  {id:'numbness', label:'Numbness & neuropathy', title:'Numbness and neuropathy',
   blurb:'Tingling and burning in the hands or feet usually has a traceable cause. The work is narrowing it down before reaching for nerve testing.',
   bullets:['Mapping where symptoms are and how they spread','Diabetes, B12, thyroid and medication causes','Whether nerve conduction testing would change anything','Pain options that are not opioids']},
  {id:'tremor', label:'Tremor & movement', title:'Tremor and movement disorders',
   blurb:'Tremor shows well on camera. We can often separate essential tremor from parkinsonian tremor in the first visit and start treatment straight away.',
   bullets:['Guided tremor tasks, recorded with your permission','Family history and medication triggers','Treatment trial with clear expectations','Referral pathway if in-person exam is needed']},
  {id:'unsure', label:"I'm not sure yet", title:"Not sure where this fits",
   blurb:'That is a completely normal place to start. Bring the symptoms as you experience them — sorting them into a diagnosis is our job, not yours.',
   bullets:['Open-ended first visit, no prepared vocabulary needed','Review of records you already have','Clear next step, even if that step is a different specialty','No charge if we decide neurology is not the right fit']}
];
const DAYS = [
  {dow:'Mon', date:'14', slots:['9:00 am','11:30 am']},
  {dow:'Tue', date:'15', slots:['8:30 am','1:15 pm','3:45 pm']},
  {dow:'Wed', date:'16', slots:[]},
  {dow:'Thu', date:'17', slots:['10:00 am','2:00 pm','4:30 pm']},
  {dow:'Fri', date:'18', slots:['9:30 am','12:45 pm']}
];
const CHIP_BASE = 'border-radius:999px;padding:10px 17px;font-size:14px;transition:all .22s;';

class Component extends DCLogic {
  state = {active:'headache', bookingOpen:false, step:1, pick:'headache', dayIdx:1, time:null,
    form:{name:'',email:'',state:'',notes:''}, error:'', openFaq:0};

  chipStyle(on){ return CHIP_BASE + (on
    ? 'background:#293312;color:#F4F1E8;border:1px solid #293312;'
    : 'background:transparent;color:#3C4530;border:1px solid rgba(41,51,18,.25);'); }

  makeChips(sel, set){
    return SYMPTOMS.map(s => ({id:s.id, label:s.label, style:this.chipStyle(sel===s.id),
      onSelect:() => this.setState(set(s.id))}));
  }

  renderVals(){
    const st = this.state;
    const active = SYMPTOMS.find(s => s.id === st.active) || SYMPTOMS[0];
    const day = DAYS[st.dayIdx];
    const picked = SYMPTOMS.find(s => s.id === st.pick) || SYMPTOMS[0];
    const canNext2 = !!st.time;

    return {
      nextSlotLabel: 'Tuesday 15th, 8:30 am',
      symptomChips: this.makeChips(st.active, id => ({active:id})),
      activeSymptom: active,
      steps: [
        {n:'01', title:'Book a time', body:'Pick a slot that suits you. Evenings and early mornings are held open for people who work.'},
        {n:'02', title:'Meet for 45 minutes', body:'A secure video room in your browser — nothing to install. Bring a family member if it helps.'},
        {n:'03', title:'Leave with a plan', body:'A written summary, prescriptions sent to your pharmacy, and any tests ordered near you.'}
      ],
      quotes: [
        {text:'“I had waited eleven months for a neurology appointment. This one happened on a Thursday and lasted longer than any I have had.”', who:'R. M. — chronic migraine'},
        {text:'“She drew my seizure pattern out on screen so I could finally see it. I understood my own condition for the first time.”', who:'T. A. — focal epilepsy'},
        {text:'“No waiting room, no parking garage, no four hours off work. Just the actual appointment.”', who:'J. P. — neuropathy'}
      ],
      faqs: [
        {q:'Do you take insurance?', a:'Most major plans are accepted in the twelve states where Dr. Haddad is licensed. Self-pay visits are flat-rate and quoted before you book — no surprise billing, ever.'},
        {q:'Can you prescribe medication?', a:'Yes, including most neurology medications, sent electronically to your pharmacy. Controlled substances follow state-specific rules, which we will explain during the visit.'},
        {q:'What if I need a scan or bloodwork?', a:'Tests are ordered at a lab or imaging centre near you, and results come back to the practice. We review them together at a follow-up rather than leaving you to read a report alone.'},
        {q:'Is telehealth really enough for neurology?', a:'For a large share of conditions, yes — the diagnosis lives in the history, and much of the exam translates to video. When it does not, we say so and help arrange an in-person assessment.'}
      ].map((f, i) => ({...f, open: st.openFaq === i, sign: st.openFaq === i ? '–' : '+',
        onToggle: () => this.setState(s => ({openFaq: s.openFaq === i ? -1 : i}))})),

      bookingOpen: st.bookingOpen,
      openBooking: () => this.setState({bookingOpen:true, step:1, error:''}),
      closeBooking: () => this.setState({bookingOpen:false}),
      stop: e => e.stopPropagation(),
      next: () => this.setState(s => ({step: s.step === 2 && !s.time ? 2 : Math.min(s.step + 1, 4)})),
      back: () => this.setState(s => ({step: Math.max(s.step - 1, 1), error:''})),
      isStep1: st.step === 1, isStep2: st.step === 2, isStep3: st.step === 3, isStep4: st.step === 4,
      stepLabel: ['Step 1 of 3 · Reason','Step 2 of 3 · Time','Step 3 of 3 · Details','Confirmed'][st.step - 1],
      progressStyle: `height:100%;width:${[33,66,100,100][st.step-1]}%;background:#6E7F45;transition:width .4s ease`,
      modalChips: this.makeChips(st.pick, id => ({pick:id})),

      days: DAYS.map((d, i) => {
        const on = i === st.dayIdx, out = d.slots.length === 0;
        return {dow:d.dow, date:d.date, availLabel: out ? 'full' : d.slots.length + ' open',
          style:'display:flex;flex-direction:column;align-items:center;gap:2px;padding:11px 6px;border-radius:12px;transition:all .22s;' +
            (out ? 'border:1px dashed rgba(41,51,18,.2);background:transparent;color:#A9AC9C;cursor:not-allowed;'
                 : on ? 'border:1px solid #6E7F45;background:#6E7F45;color:#FFFDF8;'
                      : 'border:1px solid rgba(41,51,18,.2);background:#F9F7F0;color:#3C4530;'),
          onSelect: () => { if (!out) this.setState({dayIdx:i, time:null}); }};
      }),
      slotHeading: day.slots.length ? `${day.dow}day ${day.date} September` : 'No times left that day',
      slots: day.slots.map(t => ({label:t, style: this.chipStyle(st.time === t),
        onSelect: () => this.setState({time:t})})),
      step2NextLabel: canNext2 ? 'Continue' : 'Pick a time',
      step2NextStyle: 'flex:1;border:0;border-radius:999px;padding:14px;font-size:15px;transition:all .25s;' +
        (canNext2 ? 'background:#293312;color:#F4F1E8;cursor:pointer;' : 'background:rgba(41,51,18,.12);color:#8A9079;cursor:not-allowed;'),

      form: st.form,
      states: ['California','Colorado','Illinois','Massachusetts','Michigan','New York','Ohio','Oregon','Pennsylvania','Texas','Virginia','Washington'],
      onName: e => this.setField('name', e.target.value),
      onEmail: e => this.setField('email', e.target.value),
      onState: e => this.setField('state', e.target.value),
      onNotes: e => this.setField('notes', e.target.value),
      hasError: !!st.error, errorText: st.error,
      summaryLine: `${picked.label} · ${day.dow} ${day.date} Sept, ${st.time || '—'} · 45 minutes`,
      confirmLine: `${day.dow}day ${day.date} September at ${st.time || '—'}, 45 minutes with Dr. Haddad.`,
      submit: () => {
        const f = this.state.form;
        const err = !f.name.trim() ? 'Please add the name the visit should be booked under.'
          : !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(f.email) ? 'That email does not look right — the video link goes there.'
          : !f.state ? 'We need the state you will be in, for licensing.' : '';
        this.setState(err ? {error:err} : {error:'', step:4});
      }
    };
  }

  setField(k, v){ this.setState(s => ({form:{...s.form, [k]:v}, error:''})); }
}
