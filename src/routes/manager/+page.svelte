<script>

</script>

<main>
  <h1>Manager Dashboard <hr> </h1>


  
  <div class = "main-layout">
    <div class = "location-shifts">

      <div class="filters">
        <fieldset>
          <legend>Location</legend>
          <select aria-label="Location">
            <option>123 Address Dr.</option>
            <option>456 Oak St.</option>
            <option>789 Maple Ave.</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Date range</legend>
          <input type="date" aria-label="Start date" value="2026-09-28" />
          -
          <input type="date" aria-label="End date" value="2026-09-30" />
        </fieldset>
        <fieldset>
          <legend>Time of day</legend>
          <input type="time" aria-label="Start time" value="08:00" />
          -
          <input type="time" aria-label="End time" value="20:00" />
        </fieldset>
      </div>

      <div class="location-title">
        <h2>123 Address Dr.</h2>
        <!-- <button type="button">View Calendar</button> -->
      </div>
      <hr>

      <div class = "shift">
        <div class="shift-details">
          <span class="shift-date">9/28</span>
          <span class="shift-time">12 PM - 8 PM</span>
        </div>
      </div>

      <div class = "shift">
        <div class="shift-details">
          <span class="shift-date">9/28</span>
          <span class="shift-time">9 AM - 5 PM</span>
        </div>
      </div>

      <div class = "shift selected">
        <div class="shift-details">
          <span class="shift-date">9/29</span>
          <span class="shift-time">8 AM - 4 PM</span>
        </div>
        <div class="shift-actions">
          <button type="button">Edit Job</button>
          <button type="button">Remove Job</button>
        </div>
      </div>

      <div class = "shift">
        <div class="shift-details">
          <span class="shift-date">9/30</span>
          <span class="shift-time">10 AM - 6 PM</span>
          <span class="shift-status">Unclaimed</span>
        </div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 3.5C12.8 2.3 11.2 2.3 10.5 3.5L1.3 19.5C0.6 20.7 1.5 22.2 2.9 22.2H21.1C22.5 22.2 23.4 20.7 22.7 19.5L13.5 3.5Z" stroke="#FF0000" stroke-width="1" />
          <rect x="11" y="8" width="2" height="7" rx="1" fill="#FF0000"/>
          <circle cx="12" cy="17.5" r="1.2" fill="#FF0000"/>
        </svg>
      </div>

      <div class="location-actions">
        <button type="button">Add Job</button>
      </div>

    </div>

    <div class="donut-charts">
    
      <div class = "chart">
        <h2>Punctuality </h2>
        <svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
          <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="purple" stroke-width="3" stroke-dasharray="85 15" stroke-dashoffset="25"></circle>
          <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">
            85%
          </text>
        </svg>
      </div>

      <div class = "chart">
        <h2>Attendance  </h2>
        <svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
          <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="purple" stroke-width="3" stroke-dasharray="66 34" stroke-dashoffset="25"></circle>
          <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">
            66%
          </text>
        </svg>
      </div>

    </div>

  </div>

</main>


<style>
  main {
    font-family: sans-serif;
    max-width: 1200px;
    margin-inline: auto;
  }
  
  h1 {
    padding-top: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
    margin: 0;
    color: purple;
  }


  /* .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  } */

  .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    background-color: #faf8fc;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
  }

  .filters legend {
    margin-bottom: 0.35rem;
  }

  .filters fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  .main-layout {
    display: flex;
    gap: 4rem;
    padding-bottom: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .shift {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    background-color: #f6f3f8;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 14px 20px;
    min-height: 56px;
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    line-height: 1.4;
    color: #302738;
  }

  .shift.selected {
    background-color: #ece3f3;
    border: 1px solid purple;
    box-shadow: 0 0 0 1px purple;
  }

  .shift-details {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .shift-date {
    font-size: 1rem;
    color: #6f6578;
  }

  .shift-time {
    font-weight: 600;
    color: purple;
  }

  .shift-status {
    font-size: 0.875rem;
    font-weight: 600;
    color: #b42318;
  }

  .shift svg {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .shift-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .shift-actions button {
    padding: 0.4rem 0.9rem;
    font: inherit;
    font-size: 1rem;
    cursor: pointer;
  }

  .location-title {
    display: flex;
    align-items: center;
    justify-content:left;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .location-title h2 {
    margin: 0;
  }

  .location-shifts {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .location-shifts > hr {
    margin: 0;
  }

  .location-actions {
    display: flex;
    gap: 1rem;
  }

  .filters input,
  .filters select,
  .location-actions button {
    padding: 0.5rem 1rem;
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