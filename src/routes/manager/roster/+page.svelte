<script lang="ts">
  import WarningIcon from '#lib/WarningIcon.svelte';

  type Shift = {
    date: string;
    time: string;
    address: string;
  };

  type Worker = {
    id: number;
    name: string;
    email: string;
    phone: string;
    locations: string[];
    certifications: string[];
    punctuality: number; // percent
    attendance: number; // percent
    shiftsCompleted: number;
    upcoming: Shift[];
  };

  // below this percent a worker gets flagged with a warning icon
  const FLAG_THRESHOLD = 80;

  const locationOptions = ['123 Address Dr.', '456 Oak St.', '789 Maple Ave.'];

  // placeholder data until we have a backend
  let workers: Worker[] = $state([
    {
      id: 1,
      name: 'Jordan Ellis',
      email: 'jordan.ellis@example.com',
      phone: '(555) 201-4410',
      locations: ['123 Address Dr.', '456 Oak St.'],
      certifications: ['CDL', 'Forklift'],
      punctuality: 96,
      attendance: 92,
      shiftsCompleted: 48,
      upcoming: [
        { date: '9/28', time: '9 AM - 5 PM', address: '123 Address Dr.' },
        { date: '10/2', time: '8 AM - 2 PM', address: '456 Oak St.' }
      ]
    },
    {
      id: 2,
      name: 'Priya Natarajan',
      email: 'priya.n@example.com',
      phone: '(555) 318-0092',
      locations: ['456 Oak St.'],
      certifications: ['Forklift', 'Hazmat'],
      punctuality: 88,
      attendance: 95,
      shiftsCompleted: 31,
      upcoming: [{ date: '10/3', time: '10 AM - 4 PM', address: '456 Oak St.' }]
    },
    {
      id: 3,
      name: 'Marcus Reed',
      email: 'mreed@example.com',
      phone: '(555) 774-3381',
      locations: ['123 Address Dr.', '789 Maple Ave.'],
      certifications: ['CDL'],
      punctuality: 71,
      attendance: 66,
      shiftsCompleted: 19,
      upcoming: []
    },
    {
      id: 4,
      name: 'Alicia Gomez',
      email: 'alicia.gomez@example.com',
      phone: '(555) 640-1127',
      locations: ['789 Maple Ave.'],
      certifications: ['First Aid'],
      punctuality: 90,
      attendance: 78,
      shiftsCompleted: 24,
      upcoming: [{ date: '10/5', time: '9 AM - 5 PM', address: '789 Maple Ave.' }]
    },
    {
      id: 5,
      name: 'Sam Whitfield',
      email: 'sam.w@example.com',
      phone: '(555) 902-5563',
      locations: ['123 Address Dr.', '456 Oak St.', '789 Maple Ave.'],
      certifications: ['CDL', 'Hazmat', 'First Aid'],
      punctuality: 99,
      attendance: 97,
      shiftsCompleted: 112,
      upcoming: [
        { date: '9/30', time: '11 AM - 7 PM', address: '123 Address Dr.' },
        { date: '10/1', time: '9 AM - 3 PM', address: '123 Address Dr.' },
        { date: '10/4', time: '12 PM - 6 PM', address: '456 Oak St.' }
      ]
    }
  ]);

  // filter + sort controls
  let search = $state('');
  let locationFilter = $state('All');
  let certFilter = $state('All');
  let sortBy: 'name' | 'punctuality' | 'attendance' = $state('name');

  let selectedId: number | null = $state(null);

  // every certification any worker has, for the dropdown
  const certOptions = $derived([...new Set(workers.flatMap((w) => w.certifications))].sort());

  // the list actually shown, recalculated whenever a filter changes
  const visibleWorkers = $derived.by(() => {
    const q = search.trim().toLowerCase();
    const filtered = workers.filter(
      (w) =>
        (q === '' || w.name.toLowerCase().includes(q)) &&
        (locationFilter === 'All' || w.locations.includes(locationFilter)) &&
        (certFilter === 'All' || w.certifications.includes(certFilter))
    );
    return [...filtered].sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy]
    );
  });

  const selectedWorker = $derived(workers.find((w) => w.id === selectedId) ?? null);

  function isFlagged(w: Worker) {
    return w.punctuality < FLAG_THRESHOLD || w.attendance < FLAG_THRESHOLD;
  }

  function toggle(w: Worker) {
    selectedId = selectedId === w.id ? null : w.id;
  }
</script>

<!-- same donut chart as the manager dashboard, turned into a reusable snippet -->
{#snippet donut(label: string, value: number)}
  <div class="chart">
    <h3>{label}</h3>
    <svg viewBox="0 0 42 42" class="donut">
      <circle cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
      <circle
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        stroke={value < FLAG_THRESHOLD ? 'orange' : 'purple'}
        stroke-width="3"
        stroke-dasharray="{value} {100 - value}"
        stroke-dashoffset="25"
      ></circle>
      <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">{value}%</text>
    </svg>
  </div>
{/snippet}

<main>
  <h1 class="page-title">Roster <hr /></h1>
  <a class="back-link" href="/manager">&larr; Back to dashboard</a>

  <div class="main-layout">
    <section class="roster-panel">
      <div class="filters">
        <fieldset>
          <legend>Search</legend>
          <input type="search" placeholder="Worker name" bind:value={search} />
        </fieldset>

        <fieldset>
          <legend>Location</legend>
          <select bind:value={locationFilter}>
            <option value="All">All locations</option>
            {#each locationOptions as loc}
              <option value={loc}>{loc}</option>
            {/each}
          </select>
        </fieldset>

        <fieldset>
          <legend>Certification</legend>
          <select bind:value={certFilter}>
            <option value="All">Any</option>
            {#each certOptions as cert}
              <option value={cert}>{cert}</option>
            {/each}
          </select>
        </fieldset>

        <fieldset>
          <legend>Sort by</legend>
          <select bind:value={sortBy}>
            <option value="name">Name</option>
            <option value="punctuality">Punctuality</option>
            <option value="attendance">Attendance</option>
          </select>
        </fieldset>
      </div>

      <p class="count">{visibleWorkers.length} of {workers.length} workers</p>

      {#each visibleWorkers as worker (worker.id)}
        <button
          type="button"
          class={['worker', isFlagged(worker) && 'flagged', worker.id === selectedId && 'selected']}
          onclick={() => toggle(worker)}
          aria-pressed={worker.id === selectedId}
        >
          <span class="worker-details">
            <span class="worker-name">{worker.name}</span>
            <span class="worker-meta">
              {worker.certifications.join(' · ')}
            </span>
            {#if isFlagged(worker)}
              <span class="worker-status">Low reliability</span>
            {/if}
          </span>

          <span class="worker-stats">
            <span title="Punctuality">P {worker.punctuality}%</span>
            <span title="Attendance">A {worker.attendance}%</span>
            {#if isFlagged(worker)}
              <span class="warning"><WarningIcon /></span>
            {/if}
          </span>
        </button>
      {:else}
        <p class="empty">No workers match these filters.</p>
      {/each}
    </section>

    <section class="detail-panel">
      {#if selectedWorker}
        <h2>{selectedWorker.name}</h2>

        <div class="contact">
          <a href="mailto:{selectedWorker.email}">{selectedWorker.email}</a>
          <a href="tel:{selectedWorker.phone}">{selectedWorker.phone}</a>
        </div>

        <div class="donut-charts">
          {@render donut('Punctuality', selectedWorker.punctuality)}
          {@render donut('Attendance', selectedWorker.attendance)}
        </div>

        <p><strong>{selectedWorker.shiftsCompleted}</strong> shifts completed</p>

        <h3>Certifications</h3>
        <div class="tags">
          {#each selectedWorker.certifications as cert}
            <span class="tag">{cert}</span>
          {/each}
        </div>

        <h3>Works at</h3>
        <ul>
          {#each selectedWorker.locations as loc}
            <li>{loc}</li>
          {/each}
        </ul>

        <h3>Upcoming shifts</h3>
        {#each selectedWorker.upcoming as shift}
          <div class="shift">
            <span class="shift-date">{shift.date}</span>
            <span class="shift-time">{shift.time}</span>
            <span class="shift-address">{shift.address}</span>
          </div>
        {:else}
          <p class="empty">No upcoming shifts.</p>
        {/each}

        <div class="detail-actions">
          <button type="button">Assign Shift</button>
          <button type="button">Message</button>
        </div>
      {:else}
        <p class="empty">Select a worker to see their details.</p>
      {/if}
    </section>
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin-inline: auto;
    font-family: sans-serif;
  }

  h1 {
    color: purple;
  }

  .page-title {
    margin: 0;
    padding: 2rem 2rem 0;
  }

  .back-link {
    display: inline-block;
    margin: 0 2rem 1rem;
    color: purple;
  }

  .main-layout {
    display: flex;
    gap: 4rem;
    padding: 0 2rem 2rem;
  }

  .roster-panel,
  .detail-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  /* filters: same look as the manager dashboard */
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    background-color: #faf8fc;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 1rem 1.25rem;
  }

  .filters fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  .filters legend {
    margin-bottom: 0.35rem;
  }

  .filters input,
  .filters select {
    padding: 0.5rem 1rem;
    font: inherit;
  }

  .count {
    margin: 0.5rem 0 0;
    color: #6f6578;
  }

  /* worker rows: same card style as the shift rows elsewhere */
  .worker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    min-height: 56px;
    padding: 14px 20px;
    box-sizing: border-box;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    background-color: #f6f3f8;
    color: #302738;
    font: inherit;
    font-family: system-ui, sans-serif;
    text-align: left;
    cursor: pointer;
  }

  .worker:hover {
    background-color: #efe8f4;
  }

  .worker.selected {
    background-color: #ece3f3;
    border-color: purple;
    box-shadow: 0 0 0 1px purple;
  }

  .worker-details {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
    min-width: 0;
  }

  .worker-name {
    color: purple;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .worker-meta {
    color: #6f6578;
    font-size: 1rem;
  }

  .worker-status {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .worker-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    font-size: 0.95rem;
  }

  .flagged .worker-status,
  .flagged .warning {
    color: orange;
  }

  .warning {
    display: flex;
  }

  /* detail panel */
  .detail-panel h2 {
    margin: 0;
    color: purple;
  }

  .detail-panel h3 {
    margin: 1rem 0 0.25rem;
  }

  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .contact a {
    color: #302738;
  }

  .donut-charts {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
  }

  .chart {
    text-align: center;
  }

  .chart h3 {
    margin: 0 0 0.5rem;
  }

  .donut {
    width: 130px;
    max-width: 100%;
    height: auto;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    padding: 2px 10px;
    border: 1px solid purple;
    border-radius: 999px;
    color: purple;
    font-size: 0.9rem;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .shift {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
    padding: 10px 16px;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    background-color: #f6f3f8;
  }

  .shift-date,
  .shift-address {
    color: #6f6578;
  }

  .shift-time {
    color: purple;
    font-weight: 600;
  }

  .detail-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .detail-actions button {
    padding: 0.5rem 1rem;
    font: inherit;
    cursor: pointer;
  }

  .empty {
    color: #6f6578;
    font-style: italic;
  }

  /* stack the two panels on narrow screens */
  @media (max-width: 800px) {
    .main-layout {
      flex-direction: column;
      gap: 2rem;
    }
  }
</style>