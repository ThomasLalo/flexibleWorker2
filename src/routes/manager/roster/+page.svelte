<script lang="ts">
  import { resolve } from '$app/paths';
  import WarningIcon from '#lib/WarningIcon.svelte';
  import { locations, roster, type Shift, type Worker } from '#lib/shared.svelte.ts';

  // a shift plus the address it belongs to, so the roster can list them per worker
  type AssignedShift = Shift & { address: string };

  // below this percent a worker gets flagged with a warning icon
  const FLAG_THRESHOLD = 80;

  // filter + sort controls
  let search = $state('');
  let locationFilter = $state('All');
  let roleFilter = $state('All');
  let sortBy: 'name' | 'punctuality' | 'attendance' = $state('name');

  // workers don't have ids, so select by name
  let selectedName: string | null = $state(null);

  // every shift in shared.svelte.ts, grouped by worker name
  const shiftsByWorker = $derived.by(() => {
    const map = new Map<string, AssignedShift[]>();
    for (const location of locations) {
      for (const shift of location.shifts) {
        if (!shift.worker) continue; // unclaimed shift
        const list = map.get(shift.worker) ?? [];
        list.push({ ...shift, address: location.address });
        map.set(shift.worker, list);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.month - b.month || a.day - b.day || a.startTime - b.startTime);
    }
    return map;
  });

  function shiftsFor(w: Worker): AssignedShift[] {
    return shiftsByWorker.get(w.name) ?? [];
  }

  // a worker "works at" a location if they have any shift there
  function locationsFor(w: Worker): string[] {
    return [...new Set(shiftsFor(w).map((s) => s.address))];
  }

  // the list actually shown, recalculated whenever a filter changes
  const visibleWorkers = $derived.by(() => {
    const q = search.trim().toLowerCase();
    const filtered = roster.filter(
      (w) =>
        (q === '' || w.name.toLowerCase().includes(q)) &&
        (locationFilter === 'All' || locationsFor(w).includes(locationFilter)) &&
        (roleFilter === 'All' || w.role === roleFilter)
    );
    return [...filtered].sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy]
    );
  });

  const selectedWorker = $derived(roster.find((w) => w.name === selectedName) ?? null);
  const selectedShifts = $derived(selectedWorker ? shiftsFor(selectedWorker) : []);

  function isFlagged(w: Worker) {
    return w.punctuality < FLAG_THRESHOLD || w.attendance < FLAG_THRESHOLD;
  }

  function toggle(w: Worker) {
    selectedName = selectedName === w.name ? null : w.name;
  }

  // 9 -> "9 AM", 14 -> "2 PM"
  function formatHour(h: number) {
    if (h === 0 || h === 24) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  }

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
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
        stroke={value < FLAG_THRESHOLD ? '#FF6600' : '#4D148C'}
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
  <a class="back-link" href={resolve('/manager')}>&larr; Back to dashboard</a>

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
            {#each locations as location}
              <option value={location.address}>{location.address}</option>
            {/each}
          </select>
        </fieldset>

        <fieldset>
          <legend>Role</legend>
          <select bind:value={roleFilter}>
            <option value="All">Any</option>
            <option value="handler">Handler</option>
            <option value="courier">Courier</option>
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

      <p class="count">{visibleWorkers.length} of {roster.length} workers</p>

      {#each visibleWorkers as worker (worker.name)}
        <button
          type="button"
          class={['worker', isFlagged(worker) && 'flagged', worker.name === selectedName && 'selected']}
          onclick={() => toggle(worker)}
          aria-pressed={worker.name === selectedName}
        >
          <span class="worker-details">
            <span class="worker-name">{worker.name}</span>
            <span class="worker-meta">{capitalize(worker.role)}</span>
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

        <h3>Role &amp; certifications</h3>
        <div class="tags">
          <span class="tag role">{capitalize(selectedWorker.role)}</span>
          {#each selectedWorker.certifications as cert}
            <span class="tag">{cert}</span>
          {/each}
        </div>

        <h3>Works at</h3>
        {#if locationsFor(selectedWorker).length > 0}
          <ul>
            {#each locationsFor(selectedWorker) as address}
              <li>{address}</li>
            {/each}
          </ul>
        {:else}
          <p class="empty">Not assigned to any location yet.</p>
        {/if}

        <h3>Shifts ({selectedShifts.length})</h3>
        {#each selectedShifts as shift}
          <div class={['shift', shift.canceled && 'shift-canceled', shift.timeChanged && 'time-changed']}>
            <span class="shift-date">{shift.month}/{shift.day}</span>
            <span class="shift-time">{formatHour(shift.startTime)} - {formatHour(shift.endTime)}</span>
            <span class="shift-address">{shift.address}</span>
            {#if shift.canceled}
              <span class="shift-status">Canceled</span>
            {:else if shift.timeChanged}
              <span class="shift-status">Time Changed</span>
            {/if}
          </div>
        {:else}
          <p class="empty">No shifts assigned.</p>
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
    color: #4D148C;
  }

  .page-title {
    margin: 0;
    padding: 2rem 2rem 0;
  }

  .back-link {
    display: inline-block;
    margin: 0 2rem 1rem;
    color: #4D148C;
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
    border-color: #4D148C;
    box-shadow: 0 0 0 1px #4D148C;
  }

  .worker-details {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
    min-width: 0;
  }

  .worker-name {
    color: #4D148C;
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
    color: #FF6600;
  }

  .warning {
    display: flex;
  }

  /* detail panel */
  .detail-panel h2 {
    margin: 0;
    color: #4D148C;
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
    border: 1px solid #4D148C;
    border-radius: 999px;
    color: #4D148C;
    font-size: 0.9rem;
  }

  .tag.role {
    background-color: #4D148C;
    color: white;
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
    color: #4D148C;
    font-weight: 600;
  }

  .shift-status {
    font-size: 0.875rem;
    font-weight: 600;
  }

  /* same colors the worker dashboard uses for these states */
  .time-changed .shift-status {
    color: #FF6600;
  }

  .shift-canceled .shift-status {
    color: red;
  }

  .shift-canceled .shift-time {
    text-decoration: line-through;
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