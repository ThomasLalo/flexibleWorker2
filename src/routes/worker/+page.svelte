<script lang="ts">
  import { resolve } from '$app/paths';
  import WarningIcon from '#lib/WarningIcon.svelte';
  import {locations, roster, type Shift} from '#lib/shared.svelte.ts';
  // currently logged in
  let currentWorker = $state("Emma Johnson")
  // takes the worker logged in and changes the doughnut graphs to satisfty that persons infomration
  let workerInfo = $derived(roster.find(worker => worker.name === currentWorker));


  let selectedShift: Shift | null = $state(null);

  function toggle(shift: Shift) {
    if (selectedShift === shift) {
      selectedShift = null;
      return;
    }
    selectedShift = shift;
  }

  function removeShift(shift: Shift){
    delete shift.worker;
    selectedShift = null; 
  }

</script>

<main>
<div class = "panel">
    <a href={resolve('/')}>&lt;&lt;&lt; Back to login</a>
  </div>
  <h1 class="dashboard-title">Employee Dashboard <hr /></h1>


  <div class="dashboard-columns">
    <section class="dashboard-panel">
      <h1>Scheduled Shifts</h1>

      {#each locations as location}
        <header class="location">
          <h2>{location.address}</h2>
          <button type="button">View Map</button>
        </header>

        <!-- {#each location.shifts as shift} -->
         <!-- has the shifts that appear be based on the employee that is selected -->
         {#each location.shifts.filter(shift => shift.worker === currentWorker) as shift}

          <!-- svelte does not like that I made a div act like a button, for accessibility reasons. the next comment suppresses warnings about that -->
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div class={["shift", shift.canceled && "shift-canceled", shift.timeChanged && "time-changed", shift === selectedShift && "selected"]} onclick={() => toggle(shift)} >

            <div class="shift-details">
              <span class="shift-date">{shift.month}/{shift.day}</span> 
              <span class="shift-time">{shift.startTime}:00 - {shift.endTime}:00</span>

              {#if shift.canceled}
                <span class="shift-status">Shift Canceled</span>
              {/if}

              {#if shift.timeChanged}
                <span class="shift-status">Time Changed</span>
              {/if}
            </div>

            <div class="shift-actions">
              {#if shift.canceled || shift.timeChanged}
                <WarningIcon />
              {/if}
              {#if shift === selectedShift}
                <button type="button" onclick={(event) => {event.stopPropagation(); shift.canceled = true }}> Remove Shift</button>
              {/if}
            </div>
          </div>
        {/each}
      {/each}
    </section>

    <section class="dashboard-panel">
      <h1>Claim Shifts</h1>

      <form class="filters" action ={resolve('/worker/claim-job')}>
        <fieldset>
          <legend>Location</legend>
          <select name = "location">
            {#each locations as location}
              <option>{location.address}</option>
            {/each}
          </select>
        </fieldset>

        <fieldset>
          <legend>Date range</legend>
          <input type="date" value="2026-09-28" name = "startDate"/>
          -
          <input type="date" value="2026-09-30" name = "endDate"/>
        </fieldset>

        <fieldset>
          <legend>Time of day</legend>
          <input type="time" value="08:00" name = "startTime" />
          -
          <input type="time" value="20:00" name = "endTime" />
        </fieldset>

        <button type="submit">View Available Shifts</button>
      </form>

      <!-- dounut circles that change based on the worker selected -->
      <div class="donut-charts">
    
      <div class = "chart">
        <h2>Punctuality </h2>
        <svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
          <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="purple" stroke-width="3" stroke-dasharray="{workerInfo?.punctuality  ?? 0} {100 - (workerInfo?.punctuality  ?? 0)}" stroke-dashoffset="25"></circle>
          <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">
            {workerInfo?.punctuality  ?? 0}%
          </text>
        </svg>
      </div>

      <div class = "chart">
        <h2>Attendance  </h2>
        <svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
          <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="purple" stroke-width="3" stroke-dasharray="{workerInfo?.attendance ?? 0} {100 - (workerInfo?.attendance ?? 0)}" stroke-dashoffset="25"></circle>
          <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">
            {workerInfo?.attendance  ?? 0}%
          </text>
        </svg>
      </div>

    </div>

    </section>
  </div>

  <!-- switch through the worker that is currently logged in -->
  <label class ="changeWorker">
    <select bind:value= {currentWorker}>
      {#each roster as worker}
      <option>{worker.name}</option>
      {/each}
    </select>
  </label>
</main>

<style>
  main {
    max-width: 1200px;
    margin-inline: auto;
    font-family: sans-serif;
  }

  .panel{
    padding: 1rem;
  }

  h1 {
    color: purple;
  }

  .dashboard-title {
    margin: 0;
    padding: 2rem 2rem 0;
  }

  .dashboard-columns {
    display: flex;
    gap: 4rem;
    padding: 0 2rem 2rem;
  }

  .dashboard-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .location {
    display: flex;
    gap: 1rem;
  }

  .location button {
    font-size: 1rem;
    align-self: center;
  }

  .shift {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-sizing: border-box;
    min-height: 56px;
    padding: 0;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    background-color: #f6f3f8;
    color: #302738;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    line-height: 1.4;
  }

  .shift.selected {
    background-color: #ece3f3;
    border-color: purple;
    box-shadow: 0 0 0 1px purple;
  }

  /* all the stuff on the left of the shift. date, time, and status */
  .shift-details {
    display: flex;
    flex: 1;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 12px;
    min-width: 0;
    box-sizing: border-box;
    min-height: 54px;
    padding: 14px 20px;
  }

  .shift-date {
    color: #6f6578;
    font-size: 1rem;
  }

  .shift-time {
    color: purple;
    font-weight: 600;
  }

  .shift-status {
    font-size: 0.875rem;
    font-weight: 600;
  }

  /* the stuff that is sometimes on the right. warning icons or remove shift button */
  .shift-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    margin-right: 20px;
  }

  /* when a shift div gets modified with .time-changed or .shift-canceled it changes the color of the warning icon or svg */
  /* there is probably a better way to do this */
  .time-changed .shift-status,
  .time-changed .shift-actions {
    color:orange;
  }

  .shift-canceled .shift-status,
  .shift-canceled .shift-actions {
    color: red;
  }

  .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
  .filters select,
  .filters button {
    padding: 6px 12px;
    font: inherit;
    cursor: pointer;
  }

  .donut-charts {
    flex: 1;
    display: flex;
    /* flex-direction: column; */
    justify-content: space-around;
    min-width: 0;
  }

  .chart {
    text-align: center;
  }

  .donut {
    width: 150px;
    max-width: 100%;
    height: auto;
  }

</style>
