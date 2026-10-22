<script lang="ts">
    import {untrack} from 'svelte';
    import {locations} from '#lib/shared.svelte.ts';

    let {location, startDate, endDate, startTime, endTime} = $props();

    const selectedLocation = locations.find (
        item => item.address === location
    );

    // untracked cause svelte makes all props reactive. 
    // the data passed in through props here is contsant, and I treat it that, but that causes warnings because svelte expects it to be reactive
    // and also svelte doesn't like unreactive let variables used in the HTML
    const { month, monthNum, skipDays, days } = untrack(() => {
        let month = "";
        let monthNum = 0;
        let skipDays = 0;
        let days = 0;

        if (startDate.slice(5, 7) === "09") {
            month = "September";
            monthNum = 9;
            skipDays = 2;
            days = 30;
        } else if (startDate.slice(5, 7) === "10") {
            month = "October";
            monthNum = 10;
            skipDays = 4;
            days = 31;
        }

        return { month, monthNum, skipDays, days };
    });

    function getShiftsForDay(day: number) {
        const shifts = selectedLocation?.shifts ?? [];

        return shifts.filter(
            shift => shift.day === day && shift.month === monthNum
        );
    }

</script>

<h1>{month}</h1>
<div class="calendar">

    <div class="label" id="Sunday">Sunday</div>
    <div class="label" id="Monday">Monday</div>
    <div class="label" id="Tuesday">Tuesday</div>
    <div class="label" id="Wednesday">Wednesday</div>
    <div class="label" id="Thursday">Thursday</div>
    <div class="label" id="Friday">Friday</div>
    <div class="label" id="Saturday">Saturday</div>


    {#each {length: skipDays} }
        <div class="day empty"></div>
    {/each}

    {#each {length: days}, i}
        <div class="day">{i+1}
            {#each getShiftsForDay(i + 1) as shift (shift)}
                <div class="shift">
                    {shift.startTime}:00 - {shift.endTime - 12}:00
                </div>
            {/each}
        </div>
        
    {/each}

</div>


<style>

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
