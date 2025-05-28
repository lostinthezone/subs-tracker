<script setup lang="ts">
  import {usePlayers, useSubTime} from "~/states";
  
  let subTime = useSubTime();
  let playerName = useState<string>(() => "")
  
  let players = usePlayers();
  
  players.value = ["Jake", "Sammy", "Albi", "Hewy", "Roo", "Ishaan"];
  
  function addPlayer(name: string) {
    playerName.value = "";
    players.value.push(name);
  }
  
</script>

<template>
  <div class="flex flex-col p-2 gap-2">
    <span>Player name</span>
    <UInput v-model="playerName"></UInput>
    <div>
    <UButton @click="addPlayer(playerName)">Add player</UButton>
    </div>
    
    <h2>Players</h2>
    <ul>
      <li v-for="player in players" :key="player">{{ player }}</li>
    </ul>
    
    <span>Sub time</span>
    <UInput v-model="subTime"></UInput>
    
    <div>
    <UButton to="/play-game">Start</UButton>
    </div>
    
  </div>
</template>

<style scoped></style>
