
<script setup lang="ts">

interface Player {
  id: number;
  name: string;
  timeOnField: number;
  timeOffField: number;
  totalTimeOnField: number;
  totalTimeOffField: number;
  subNow: boolean;
  position: string;
}


let totalTime = useState<number>(() => 0);
let startTime = useState<number>(() => (new Date()).getSeconds());

let onFieldPlayers = useState<Player[]>(() => [
  { id: 1, name: "Player 1", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false, position: "field", timeOffField: 0 },
  { id: 2, name: "Player 2", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false, position: "field", timeOffField: 0 }
]);

let offFieldPlayers = useState<Player[]>(() => [
  { id: 3, name: "Player 3", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0 },
  { id: 4, name: "Player 4", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0 }
]);

let isRunning = useState<Boolean>(() => false);
let history = useState<string[]>(() => ["App started"]);
let subTime = useState<number>(() => 10);

let version = "0.3";

let interval: any = null;


function substitute(player: any, status: string) {
  if (status === "off") {
    history.value.push(new Date().toLocaleTimeString() + ": player " + player.name + " went off field with "+ formatTime(player.timeOnField) + " time on field");
    offFieldPlayers.value.push({ ...player, timeOffField: 0 });
    onFieldPlayers.value = onFieldPlayers.value.filter(p => p.id !== player.id);
  } else {
    history.value.push(new Date().toLocaleTimeString() + ": player " + player.name + " went on field");
    onFieldPlayers.value.push({ ...player, timeOnField: 0, subNow: false });
    offFieldPlayers.value = offFieldPlayers.value.filter(p => p.id !== player.id);
  }
}
function swapTopPlayers() {
  if (onFieldPlayers.value.length > 0 && offFieldPlayers.value.length > 0) {
    const onFieldTop: any = onFieldPlayers.value.shift();
    const offFieldTop: any = offFieldPlayers.value.shift();

    onFieldTop.timeOffField = 0;
    onFieldTop.subNow = false;
    offFieldTop.timeOnField = 0;
    
    onFieldPlayers.value.push(offFieldTop);
    offFieldPlayers.value.push(onFieldTop);
  }
}

function resetTimer() {
  history.value.push(new Date().toLocaleTimeString() + ": timer reset");
  totalTime.value = 0;
}

function toggleTimer() {
  console.log("toggleTimer");
  if (isRunning.value) {
    history.value.push(new Date().toLocaleTimeString() + ": timer stopped");
    clearInterval(interval);
    isRunning.value = false;
  } else {
    history.value.push(new Date().toLocaleTimeString() + ": timer started");
    isRunning.value = true;
    interval = setInterval(() => {
      totalTime.value++;
      onFieldPlayers.value.forEach(player => {
        player.timeOnField++;
        player.totalTimeOnField++;
        if (player.timeOnField > subTime.value) {
          player.subNow = true;
        }
      });
      offFieldPlayers.value.forEach(player => {
        player.timeOffField++;
        player.totalTimeOffField++;
      });
    }, 1000);
  }
}

function formatTime(seconds: any) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

</script>

<template>
  <UApp>
  <div>
    <h1>Substitution Tracker</h1>
    <div class="flex">
    <h2 class="mr-5">Total Time: {{ formatTime(totalTime) }} (TODO start time)</h2><UBadge v-if="isRunning" color="neutral">Running</UBadge> <p class="ml-4">Sub time: {{ subTime }} seconds</p>
    </div>
    <div class="lists">
      <div class="list" style="width: 100%">
        <h2>On Field <UIcon name="i-lucide-circle-play" class="size-5" /></h2>
        <ul>
          <li v-for="player in onFieldPlayers" :key="player.id" class="mb-4">
 
<!--            <UCheckbox></UCheckbox> -->
            {{ player.name }} - {{ formatTime(player.timeOnField) }} ({{ formatTime(player.totalTimeOnField) }}) <UBadge color="neutral" v-if="player.subNow === true">Sub</UBadge>
            <UButton @click="substitute(player, 'off')"  trailing-icon="i-lucide-arrow-right" size="md" class="ml-4">Sub Off</UButton>
          </li>
          <li v-if="onFieldPlayers.length === 0">
            <UBadge color="neutral">No players on the field</UBadge>
          </li>          
        </ul>
      </div>
      <div class="list" style="width: 100%">
        <h2>Off Field <UIcon name="i-lucide-circle-pause" class="size-5" /></h2>
        <ul>
          <li v-for="player in offFieldPlayers" :key="player.id" class="mb-4">
<!--            <UCheckbox></UCheckbox> -->
            {{ player.name }} - {{ formatTime(player.timeOffField) }} ({{ formatTime(player.totalTimeOffField) }})
            <UButton @click="substitute(player, 'on')" trailing-icon="i-lucide-arrow-left" size="md">Sub On</UButton>
          </li>
          <li v-if="offFieldPlayers.length === 0">
            <UBadge color="neutral">No players off the field</UBadge>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-5">
    <UButton @click="toggleTimer" trailing-icon="i-lucide-clock">{{ isRunning ? "Stop" : "Start" }}</UButton>
    <UButton @click="resetTimer" class="ml-2" trailing-icon="i-lucide-circle-x">Reset</UButton>
      
    <UButton @click="swapTopPlayers" class="ml-2" trailing-icon="i-lucide-arrow-right-left">Swap</UButton>
      
    </div>
    <div class="list">
      <ul>
        <li v-for="hist in history" :key="hist" class="mb-4">{{ hist }} </li>
      </ul>
    </div>
    
    <div class="list">
      2025 {{ version }}
    </div>
  </div>
  </UApp>
</template>



<style scoped>
.lists {
  display: flex;
  gap: 20px;
}
.list {
  border: 1px solid #ddd;
  padding: 10px;
}
</style>