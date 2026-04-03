function InfoCard({ title, bullets }) {
  return (
    <article className="playbook-card">
      <h4>{title}</h4>
      <ul>
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function ParametricPlaybook() {
  const modelCards = [
    {
      title: 'Parametric Insurance',
      bullets: [
        'Event-driven and index-based model.',
        'Index examples: AQI > 300, rain > 50 mm, temp > 42C.',
        'Threshold limits drive automatic payout decisions.',
        'No manual paperwork, assessor, or approval loop.',
        'Fixed payout is agreed upfront and easy to understand.',
      ],
    },
    {
      title: 'Indemnity Insurance',
      bullets: [
        'Loss-reimbursement model after claim submission.',
        'Manual adjudication and multiple checkpoints.',
        'High latency due to document and verification pipeline.',
        'Complex forms and evidence requirements.',
      ],
    },
    {
      title: 'Embedded Insurance',
      bullets: [
        'Contextual, point-of-need integration inside platform journeys.',
        'Delivered natively during product usage or checkout.',
        'Pre-filled worker data removes repeated form entry.',
        'Frictionless UX improves conversion and continuity.',
      ],
    },
  ]

  const underwriting = [
    'Cover active workers from platforms such as Zomato, Swiggy, and Zepto.',
    'Require minimum 7 active delivery days before coverage starts.',
    'Maintain city-based pools (for example Delhi AQI pool and Mumbai rain pool).',
    'Workers with fewer than 5 active days in 30 can be assigned lower tier cover.',
    'Keep onboarding compact, targeted to under 4-5 steps.',
  ]

  const triggerDesign = [
    'Sample threshold: AQI > 300 from CPCB feed in zones like Delhi, Gurugram, Noida.',
    'Use statistical simulation and forecasting methods to design triggers.',
    'Use at least 10 years of historical data where possible.',
    'Trigger conditions should match city plus worker active hours.',
    'Prefer ward-level inputs over city averages for precision.',
  ]

  const pricing = [
    'Target range: Rs. 20-Rs. 50 per worker per week.',
    'Base logic: trigger probability x average daily income loss x days exposed.',
    'Adjust price by city, peril type, and worker activity tier.',
    'Align weekly cycle with gig payout rhythm, not monthly billing.',
    'Price should remain affordable and sustainable together.',
  ]

  const actuarial = [
    'Burning Cost Rate (BCR) = total claims / total premium collected.',
    'Target BCR band: 0.55-0.70 (about 65 paise of each Re. 1 paid out).',
    'If loss ratio exceeds 85%, pause new enrollments for stabilization.',
    'Run at least one stress scenario such as a 14-day monsoon event.',
    'Keep model assumptions transparent and simple for operations teams.',
  ]

  const claimSteps = [
    {
      title: '1. Trigger fires',
      text: 'IMD/CPCB API detects AQI 380 in Delhi NCR (for example 6:00 PM Tuesday) and hits first threshold for 30% payout.',
    },
    {
      title: '2. Policy checked',
      text: 'System finds active workers in the trigger zone with valid weekly coverage.',
    },
    {
      title: '3. Fraud verified',
      text: 'Cross-check worker activity with platform and location signals before payout.',
    },
    {
      title: '4. Payout released',
      text: 'Example payout: Rs. 500 transferred to worker UPI within 2 hours and SMS confirmation sent.',
    },
  ]

  const settlementFlow = [
    'Trigger confirmed by oracle or weather API once event threshold is crossed.',
    'Worker eligibility validated for active policy, correct zone, and no duplicate claim.',
    'Payout amount calculated from fixed daily amount x trigger days.',
    'Transfer initiated using UPI, IMPS, or direct bank rails within minutes.',
    'System record updated (PolicyCenter logs payout, BillingCenter reconciles).',
  ]

  const controlChecks = [
    'Zero-touch experience: worker should do nothing to receive payout.',
    'Settlement time should be in minutes, not hours, in normal conditions.',
    'Fraud check must happen before payment, not after payment.',
    'Rollback logic must exist for partial or failed transfer attempts.',
    'Traditional flow benchmark: filing + investigation + approval can take 15-30 days; parametric should complete in minutes.',
  ]

  return (
    <section className="panel playbook-panel" id="playbook">
      <div className="playbook-head">
        <h2>Parametric Insurance Operating Playbook</h2>
        <p className="muted">
          Slide-derived summary for underwriting, pricing, triggers, claims, and settlement strategy.
        </p>
      </div>

      <div className="playbook-model-grid">
        {modelCards.map((card) => (
          <InfoCard key={card.title} title={card.title} bullets={card.bullets} />
        ))}
      </div>

      <div className="playbook-two-col">
        <InfoCard title="Underwriting: who gets covered" bullets={underwriting} />
        <InfoCard title="Trigger Design: what fires payout" bullets={triggerDesign} />
      </div>

      <div className="playbook-two-col">
        <InfoCard title="Pricing: weekly premium model" bullets={pricing} />
        <InfoCard title="Actuarial Basics: model guardrails" bullets={actuarial} />
      </div>

      <div className="playbook-steps">
        <h3>Claim Structure in Parametric Insurance</h3>
        <p className="muted playbook-note">
          In this model there is no filing, no investigation loop, and no manual approval gate for the worker.
        </p>
        <div className="claim-steps-grid">
          {claimSteps.map((step) => (
            <article key={step.title} className="claim-step-card">
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="playbook-settlement">
        <h3>Settlement Strategy and Channels</h3>
        <ul>
          {settlementFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <p className="muted">
          Recommended channels: UPI transfer as primary, IMPS-to-bank fallback, Razorpay/Stripe sandbox for demo simulation.
        </p>
      </div>

      <div className="playbook-controls">
        <h3>Operational Controls (Must-Have)</h3>
        <ul>
          {controlChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ParametricPlaybook
