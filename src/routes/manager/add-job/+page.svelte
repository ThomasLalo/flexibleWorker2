<script>

</script>

<!-- https://codepen.io/editor/Thomas-Lalo/pen/01a0d11e-f199-7798-b5d4-fe2d10208e3f -->

<main>
  <div class = "panel">

    <h1>September</h1>
    <div class="calendar">

      <div class="label" id="Sunday">Sunday</div>
      <div class="label" id="Monday">Monday</div>
      <div class="label" id="Tuesday">Tuesday</div>
      <div class="label" id="Wednesday">Wednesday</div>
      <div class="label" id="Thursday">Thursday</div>
      <div class="label" id="Friday">Friday</div>
      <div class="label" id="Saturday">Saturday</div>

      <div class="day empty"></div>
      <div class="day empty"></div>

      <div class="day">1</div>
      <div class="day">2</div>
      <div class="day">3</div>
      <div class="day">4</div>
      <div class="day">5</div>
      <div class="day">6</div>
      <div class="day">7</div>
      <div class="day">8</div>
      <div class="day">
        9
        <div class="shift">
          9:00-5:00
          <span class="shift-tooltip">I will make this display the job details nicely later</span>
        </div>
      </div>
      <div class="day">10</div>
      <div class="day">11</div>
      <div class="day">12</div>
      <div class="day">13</div>
      <div class="day">14</div>
      <div class="day">15</div>
      <div class="day">16</div>
      <div class="day">17</div>
      <div class="day">18</div>
      <div class="day">19</div>
      <div class="day">20</div>
      <div class="day">21</div>
      <div class="day">22</div>
      <div class="day">23</div>
      <div class="day">24</div>
      <div class="day">25</div>
      <div class="day">26</div>
      <div class="day">27</div>
      <div class="day">28</div>
      <div class="day selected-day">29</div>
      <div class="day">30</div>

      <div class="day empty"></div>
      <div class="day empty"></div>
      <div class="day empty"></div>

    </div>

  </div>
  <div class = "panel">
    <h1>Add Job</h1>
    <p>Create shift on September 29? </p> <br>
    <button type="button">confirm</button>

</div>
</main>


<style>

  main {
    display: flex;
    justify-content: center;
    font-family: sans-serif;
    padding: 20px;
    margin: 0;
  }

  .panel {
    padding: 1rem;
  }

  .calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    max-width: 700px;
  }

  .label {
    font-weight: bold;
    text-align: center;
    padding-bottom: 4px;
  }

  .day {
    aspect-ratio: 1;
    padding: 4px;
    border: 1px solid purple;
    border-radius: 4px;
  }

  .day:hover {
    background-color: purple;
    color: white;
  }

  .day.empty {
    border: none;
  }

  .day.empty:hover {
    background-color: white;
  }

  .shift {
    background-color: orange;
    text-align: center;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  }

  .shift-tooltip {
    visibility: hidden;
    position: absolute;
    top: 50%;
    left: 110%;
    transform: translateY(-50%);
    z-index: 1;
    background-color: white;
    color: black;
    padding: 4px 4px;
    border-radius: 4px;
    border: 1px solid black;
    width: 200px;
  }

  .shift-tooltip::after {
    content: "";
    position: absolute;
    top: 50%;
    left: -5px;
    width: 10px;
    height: 10px;
    box-sizing: border-box;
    background-color: inherit;
    border-left: inherit;
    border-bottom: inherit;
    transform: translateY(-50%) rotate(45deg);
  }

  .shift:hover .shift-tooltip {
    visibility: visible;
  }

  .selected-day {
    background-color: purple;
    color: white;
  }

</style>