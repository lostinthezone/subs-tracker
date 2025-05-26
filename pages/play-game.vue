<script setup lang="ts">

import {usePlayers} from "~/states";

let players = usePlayers();

interface Player {
  id: number;
  name: string;
  timeOnField: number;
  timeOffField: number;
  totalTimeOnField: number;
  totalTimeOffField: number;
  subNow: boolean;
  position: string;
  
  baseTotalTimeOnField: number;
  baseTotalTimeOffField: number;
  
  subOnTime: number;
  subOffTime: number;
  
  lastUpdateOff: number;
  lastUpdateOn: number;
}


let totalTime = useState<number>(() => 0);

let startTime = useState<Date>(() => new Date());

let timerStartTime = useState<number>(() => 0);
let diffTime = useState<number>(() => 0);

let lastUpdated = 0;

let onFieldPlayers = useState<Player[]>(() => [
]);

let offFieldPlayers = useState<Player[]>(() => [
  // { id: 3, name: "Player 3", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0 },
  // { id: 4, name: "Player 4", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0 }
]);

let pos = 1;
players.value.forEach(player => {
  offFieldPlayers.value.push({ id: pos, name: player, timeOffField: 0, totalTimeOffField: 0, 
    totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0, 
    baseTotalTimeOnField: 0, baseTotalTimeOffField: 0, subOnTime: 0, subOffTime: 0, lastUpdateOn: 0, lastUpdateOff: 0 })
  pos ++;
})

// let onFieldPlayers = useState<Player[]>(() => [
//   { id: 1, name: "Player 1", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false, position: "field", timeOffField: 0 },
//   { id: 2, name: "Player 2", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false, position: "field", timeOffField: 0 }
// ]);
//
// let offFieldPlayers = useState<Player[]>(() => [
//   { id: 3, name: "Player 3", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0 },
//   { id: 4, name: "Player 4", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0 }
// ]);

let isRunning = useState<Boolean>(() => false);
let history = useState<string[]>(() => ["App started"]);
let subTime = useState<number>(() => 10);

let version = "0.6";

let interval: any = null;


function substitute(player: any, status: string) {
  if (status === "off") {
    // Sub off
    history.value.push(new Date().toLocaleTimeString() + ": player " + player.name + " went off field with "+ formatTime4(player.timeOnField) + " time on field");
    offFieldPlayers.value.push({ ...player, timeOffField: 0, baseTotalTimeOffField: player.totalTimeOffField, subOffTime: new Date().getTime(), lastUpdateOff: new Date().getTime() });
    onFieldPlayers.value = onFieldPlayers.value.filter(p => p.id !== player.id);
  } else {
    // Sub on
    history.value.push(new Date().toLocaleTimeString() + ": player " + player.name + " went on field");
    onFieldPlayers.value.push({ ...player, timeOnField: 0, subNow: false, baseTotalTimeOnField: player.totalTimeOnField, subOnTime: new Date().getTime(), lastUpdateOn: new Date().getTime() });
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
    
    diffTime.value = 0;
    
  } else {
    history.value.push(new Date().toLocaleTimeString() + ": timer started");
    isRunning.value = true;
    
    lastUpdated = new Date().getTime();
    
    timerStartTime.value = new Date().getTime();
    
    
    interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const currentDiffTime = Math.abs(currentTime - lastUpdated);
      lastUpdated = currentTime;

      // var secs = Math.floor((new Date().getTime() - timerStartTime.value) / 1000);
      // console.log(secs);
      
      // totalTime.value++;
      totalTime.value += currentDiffTime;
      // console.log(totalTime.value);
      
      onFieldPlayers.value.forEach(player => {
        player.timeOnField += currentDiffTime;
        player.totalTimeOnField += currentDiffTime;
        
        if (!player.subNow && player.timeOnField > subTime.value * 1000) {
          player.subNow = true;
        }
        
      });
      offFieldPlayers.value.forEach(player => {
        player.timeOffField += currentDiffTime;
        player.totalTimeOffField += currentDiffTime;
        
        // player.timeOffField++;
        // player.totalTimeOffField++;
        
      });
      
      // diffTime.value = Math.abs(new Date().getTime() - timerStartTime.value);
      
      
    }, 200);
  }
}

function formatTime(seconds: any) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function getTimeDifference(date1: Date, date2: Date) {
  const diffMs = Math.abs(date2.getTime() - date1.getTime()); // Difference in milliseconds

  const diffSeconds = Math.floor(diffMs / 1000) % 60;
  const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    days: diffDays,
    hours: diffHours,
    minutes: diffMinutes,
    seconds: diffSeconds
  };
}

function formatDiffTime(millis: number): string {
  const seconds = Math.floor(millis / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return minutes + ":" + seconds;
}

function formatTime2(millis: number): string {
  const diffSeconds = Math.floor(millis / 1000) % 60;
  const diffMinutes = Math.floor(millis / (1000 * 60)) % 60;
  const diffHours = Math.floor(millis / (1000 * 60 * 60)) % 24;
  const diffDays = Math.floor(millis / (1000 * 60 * 60 * 24));
  
  return diffHours + ":" + diffMinutes + ":" + diffSeconds;
}

function formatTime4(millis: number): string {
  const diffSeconds = Math.floor(millis / 1000) % 60;
  const diffMinutes = Math.floor(millis / (1000 * 60)) % 60;
  const diffHours = Math.floor(millis / (1000 * 60 * 60)) % 24;
  const diffDays = Math.floor(millis / (1000 * 60 * 60 * 24));

  return diffMinutes.toString().padStart(2, '0') + ":" + diffSeconds.toString().padStart(2, '0');
}


function formatTime3(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Example usage:
console.log(formatTime(125000)); // Output: "02:05"
console.log(formatTime(45000));  // Output: "00:45"

</script>

<template>
  <div class="p-2">
<!--    <h1>Substitution Tracker</h1>-->
    <div class="flex">
      <h2 class="mr-5">Total Time: {{ formatTime4(totalTime) }}</h2><UBadge v-if="isRunning" color="neutral">Running</UBadge> 
<!--      <p class="ml-4">Sub time: {{ subTime }} seconds</p>-->
    </div>
<!--    <div>{{ formatTime2(timerStartTime) }} {{ formatTime4(diffTime) }}</div>-->
    <div class="lists mt-2">
      <div class="list" style="width: 100%">
        <h2><UIcon name="i-lucide-circle-play" class="size-5" /> On Field</h2>
        <ul>
          <li v-for="player in onFieldPlayers" :key="player.id" class="border-lime-400 mb-2 border-1 border-solid p-2 rounded-b-lg">

            <!--            <UCheckbox></UCheckbox> -->
            <div><b>{{ player.name }}</b></div>
            <div>
              <UIcon name="i-lucide-clock" class="size-3" />
            {{ formatTime4(player.timeOnField) }} ({{ formatTime4(player.totalTimeOnField) }})
            </div>
            <UButton @click="substitute(player, 'off')"  trailing-icon="i-lucide-arrow-right" size="md">Sub Off</UButton>
            <UBadge color="error" class="ml-1" v-if="player.subNow">Sub</UBadge>
          </li>
          <li v-if="onFieldPlayers.length === 0">
            <UBadge color="neutral">No players on the field</UBadge>
          </li>
        </ul>
      </div>
      <div class="list" style="width: 100%">
        <h2><UIcon name="i-lucide-circle-pause" class="size-5" /> Off Field</h2>
        <ul>
          <li v-for="player in offFieldPlayers" :key="player.id" class="mb-2 border-lime-400 border-1 border-solid p-2 rounded-b-lg">
            <!--            <UCheckbox></UCheckbox> -->
            <b>{{ player.name }}</b> - {{ formatTime4(player.timeOffField) }} ({{ formatTime4(player.totalTimeOffField) }})
            <UButton @click="substitute(player, 'on')" trailing-icon="i-lucide-arrow-left" size="md">Sub On</UButton>
          </li>
          <li v-if="offFieldPlayers.length === 0">
            <UBadge color="neutral">No players off the field</UBadge>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-2">
      <UButton @click="toggleTimer" trailing-icon="i-lucide-clock">{{ isRunning ? "Stop" : "Start" }}</UButton>
      <UButton @click="resetTimer" class="ml-2" trailing-icon="i-lucide-circle-x">Reset</UButton>

      <UButton @click="swapTopPlayers" class="ml-2" trailing-icon="i-lucide-arrow-right-left">Swap</UButton>

    </div>
    <div class="list mt-2">
      <ul>
        <li v-for="hist in history" :key="hist" class="mb-4">{{ hist }} </li>
      </ul>
    </div>

    <div class="list mt-2">
      2025 {{ version }}
    </div>
  </div>
</template>

<style scoped>
.lists {
  display: flex;
  gap: 5px;
}
.list {
  border: 1px solid #ddd;
  padding: 10px;
}


</style>
