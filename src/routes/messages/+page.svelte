<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { conversations, roster, formatTime, type Message } from '#lib/shared.svelte.ts';

  // comes from the url, ex: /messages?worker=Ava Thompson&view=manager
  let workerName = $state("");
  let view = $state("manager"); // "manager" or "worker"
  let loaded = $state(false);

  onMount(() => {
    const params = page.url.searchParams;
    workerName = params.get("worker") ?? "";
    view = params.get("view") === "worker" ? "worker" : "manager";
    loaded = true;
  });

  let worker = $derived(roster.find(w => w.name === workerName));
  let messages = $derived(conversations[workerName] ?? []);

  let newMessage = $state("");
  let chatBox: HTMLDivElement | undefined = $state();

  // scroll to the bottom when a new message shows up
  $effect(() => {
    messages.length;
    tick().then(() => chatBox?.scrollTo({ top: chatBox.scrollHeight }));
  });

  function sendMessage(e: SubmitEvent) {
    e.preventDefault();
    if (!worker || newMessage.trim() === "") return;

    const now = new Date();
    const msg: Message = {
      from: view === "worker" ? "worker" : "manager",
      text: newMessage.trim(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      time: formatTime(now.getHours(), now.getMinutes())
    };

    if (!conversations[worker.name]) {
      conversations[worker.name] = [];
    }
    conversations[worker.name].push(msg);
    newMessage = "";
  }

  // for the demo, lets you flip between the manager and worker side
  function changeView(newView: string) {
    view = newView;
    const params = new URLSearchParams({ worker: workerName, view: newView });
    replaceState(`${resolve('/messages')}?${params}`, {});
  }

  // only show the date when it changes from the message before
  function showDate(i: number) {
    if (i === 0) return true;
    return messages[i].month !== messages[i - 1].month || messages[i].day !== messages[i - 1].day;
  }
</script>

<main>
  {#if view === "manager"}
    <a class="back-link" href={resolve('/manager/roster')}>&larr; Back to roster</a>
  {:else}
    <a class="back-link" href={resolve('/worker')}>&larr; Back to dashboard</a>
  {/if}

  <h1 class="page-title">Messages <hr /></h1>

  {#if worker}
    <section class="chat">
      <div class="chat-header">
        <div>
          {#if view === "manager"}
            <h2>{worker.name}</h2>
            <span class="chat-info">{worker.role === "courier" ? "Courier" : "Handler"} &middot; {worker.phone}</span>
          {:else}
            <h2>Your Manager</h2>
            <span class="chat-info">Questions about your shifts</span>
          {/if}
        </div>
        <span class="viewing-as">Viewing as {view === "manager" ? "Manager" : worker.name}</span>
      </div>

      <div class="messages" bind:this={chatBox}>
        {#each messages as msg, i}
          {#if showDate(i)}
            <div class="date">{msg.month}/{msg.day}</div>
          {/if}
          <div class="message-row" class:mine={msg.from === view}>
            <div class="bubble">
              <p>{msg.text}</p>
              <span class="time">{msg.time}</span>
            </div>
          </div>
        {:else}
          <p class="empty">No messages yet.</p>
        {/each}
      </div>

      <form class="send-box" onsubmit={sendMessage}>
        <input type="text" placeholder="Type a message..." aria-label="Message" bind:value={newMessage} />
        <button type="submit" disabled={newMessage.trim() === ""}>Send</button>
      </form>
    </section>

    <!-- switch who is "logged in", same idea as the worker selector on the worker dashboard -->
    <div class="change-view">
      <span>View as:</span>
      <button type="button" class:active={view === "manager"} onclick={() => changeView("manager")}>Manager</button>
      <button type="button" class:active={view === "worker"} onclick={() => changeView("worker")}>{worker.name}</button>
    </div>
  {:else if loaded}
    <p class="empty">No worker selected. Pick someone from the roster to message them.</p>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin-inline: auto;
    padding: 0 2rem 2rem;
    font-family: sans-serif;
  }

  h1 {
    color: #4D148C;
  }

  .page-title {
    margin: 1rem 0 0;
  }

  .back-link {
    display: inline-block;
    margin-top: 1rem;
    color: #4D148C;
  }

  .chat {
    display: flex;
    flex-direction: column;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    padding: 1rem 1.25rem;
    background-color: #faf8fc;
    border-bottom: 1px solid #dcd5e2;
  }

  .chat-header h2 {
    margin: 0;
    color: #4D148C;
  }

  .chat-info {
    color: #6f6578;
    font-size: 0.9rem;
  }

  .viewing-as {
    padding: 2px 10px;
    border: 1px solid #4D148C;
    border-radius: 999px;
    color: #4D148C;
    font-size: 0.85rem;
  }

  .messages {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 55vh;
    min-height: 280px;
    overflow-y: auto;
    padding: 1rem 1.25rem;
  }

  .date {
    margin: 0.75rem 0 0.25rem;
    text-align: center;
    color: #6f6578;
    font-size: 0.8rem;
  }

  .message-row {
    display: flex;
  }

  .message-row.mine {
    justify-content: flex-end;
  }

  .bubble {
    max-width: 75%;
    padding: 8px 12px;
    border-radius: 14px;
    background-color: #f6f3f8;
    border: 1px solid #dcd5e2;
    color: #302738;
  }

  .mine .bubble {
    background-color: #4D148C;
    border-color: #4D148C;
    color: white;
  }

  .bubble p {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .time {
    display: block;
    margin-top: 2px;
    font-size: 0.75rem;
    opacity: 0.75;
  }

  .send-box {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    border-top: 1px solid #dcd5e2;
    background-color: #faf8fc;
  }

  .send-box input {
    flex: 1;
    min-width: 0;
    padding: 0.6rem 1rem;
    font: inherit;
    border: 1px solid #dcd5e2;
    border-radius: 999px;
  }

  .send-box button {
    padding: 0.6rem 1.25rem;
    font: inherit;
    border: none;
    border-radius: 999px;
    background-color: #FF6600;
    color: white;
    cursor: pointer;
  }

  .send-box button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .change-view {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    color: #6f6578;
  }

  .change-view button {
    padding: 0.35rem 0.85rem;
    font: inherit;
    border: 1px solid #4D148C;
    border-radius: 999px;
    background-color: white;
    color: #4D148C;
    cursor: pointer;
  }

  .change-view button.active {
    background-color: #4D148C;
    color: white;
  }

  .empty {
    color: #6f6578;
    font-style: italic;
  }

  @media (max-width: 600px) {
    main {
      padding: 0 1rem 1rem;
    }

    .bubble {
      max-width: 85%;
    }
  }
</style>
