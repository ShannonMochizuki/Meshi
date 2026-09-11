
const $ = s => document.querySelector(s);
const view = $("#view");
const modal = $("#modal");
const modalContent = $("#modalContent");

const seed = {
  profile: { name: "Ben", hp: 0, coins: 40, streak: 0, mealsLogged: 0, lastMealDate: null },
  recipes: [
    {
      id: crypto.randomUUID(),
      name: "Broccoli Pesto Pasta",
      emoji: "🥦",
      cuisine: "Italian-inspired",
      mealType: "Dinner",
      prep: 10,
      cook: 20,
      servings: 2,
      difficulty: "Easy",
      ingredients: [
        "200 g pasta",
        "1 head broccoli",
        "30 g parmesan",
        "2 cloves garlic",
        "2 tbsp olive oil",
        "1 tbsp lemon juice"
      ],
      steps: [
        "Boil the broccoli until tender.",
        "Blend broccoli, parmesan, garlic, olive oil and lemon juice into a pesto.",
        "Cook the pasta until al dente and reserve a little pasta water.",
        "Toss pasta with the pesto, loosening with pasta water as needed."
      ],
      tags: ["Vegetable", "Home-cooked", "Balanced"],
      healthFlags: { veg: true, fruit: false, protein: false, wholegrain: false, minimallyProcessed: true, highSugar: false, deepFried: false },
      notes: "Add grilled chicken or beans if you want more protein.",
      favorite: true
    },
    {
      id: crypto.randomUUID(),
      name: "Salmon Rice Bowl",
      emoji: "🐟",
      cuisine: "Japanese-inspired",
      mealType: "Dinner",
      prep: 10,
      cook: 15,
      servings: 2,
      difficulty: "Easy",
      ingredients: [
        "2 salmon fillets",
        "2 bowls cooked rice",
        "1 cucumber",
        "1 carrot",
        "1 cup edamame",
        "Soy sauce to taste"
      ],
      steps: [
        "Season and pan-sear the salmon.",
        "Slice cucumber and carrot.",
        "Arrange rice, vegetables, edamame and salmon in bowls.",
        "Finish with a small amount of soy sauce."
      ],
      tags: ["Protein", "Vegetable", "Fish", "Balanced"],
      healthFlags: { veg: true, fruit: false, protein: true, wholegrain: false, minimallyProcessed: true, highSugar: false, deepFried: false },
      notes: "",
      favorite: false
    }
  ],
  quests: [
    {
      id: "q1",
      title: "The Withered Forest",
      description: "Restore the ancient tree by gathering vitality from healthy meals.",
      targetHP: 80,
      rewardCoins: 60,
      rewardItem: "Ancient Seed",
      completed: false
    },
    {
      id: "q2",
      title: "The Herbalist's Request",
      description: "Cook a meal containing vegetables 3 times.",
      type: "vegMeals",
      target: 3,
      progress: 0,
      rewardCoins: 45,
      rewardItem: "Herbalist's Seed Pack",
      completed: false
    },
    {
      id: "q3",
      title: "A Proper Supper",
      description: "Cook a balanced meal with vegetables and protein.",
      type: "balancedMeal",
      target: 1,
      progress: 0,
      rewardCoins: 50,
      rewardItem: "Oak Table",
      completed: false
    }
  ],
  shop: [
    { id:"s1", name:"Mossy Cottage Wallpaper", icon:"🏡", price:90 },
    { id:"s2", name:"Forest Fox Companion", icon:"🦊", price:140 },
    { id:"s3", name:"Herb Garden Plot", icon:"🌿", price:110 },
    { id:"s4", name:"Copper Cooking Set", icon:"🍳", price:75 },
    { id:"s5", name:"Traveler's Cloak", icon:"🧥", price:120 }
  ],
  inventory: [],
  history: []
};

let state = loadState();

function loadState(){
  try{
    const s = localStorage.getItem("recipeQuestStateV1");
    return s ? JSON.parse(s) : structuredClone(seed);
  }catch{
    return structuredClone(seed);
  }
}
function save(){ localStorage.setItem("recipeQuestStateV1", JSON.stringify(state)); }
function esc(str=""){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function route(name){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.route===name));
  const titles={home:"Home",recipes:"Recipes",adventure:"Adventure",collection:"Collection",profile:"Profile"};
  $("#pageTitle").textContent=titles[name]||"Recipe Quest";
  if(name==="home") renderHome();
  if(name==="recipes") renderRecipes();
  if(name==="adventure") renderAdventure();
  if(name==="collection") renderCollection();
  if(name==="profile") renderProfile();
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>route(b.dataset.route)));

function healthScore(recipe){
  const f=recipe.healthFlags||{};
  let score=0;
  if(f.veg) score+=3;
  if(f.fruit) score+=2;
  if(f.protein) score+=3;
  if(f.wholegrain) score+=2;
  if(f.minimallyProcessed) score+=3;
  if(f.highSugar) score-=2;
  if(f.deepFried) score-=2;
  return Math.max(0, Math.min(10, score));
}
function rewards(recipe){
  const s=healthScore(recipe);
  const hp = s>=8 ? 28 : s>=6 ? 20 : s>=4 ? 12 : s>=2 ? 5 : 0;
  const coins = s>=8 ? 18 : s>=6 ? 14 : s>=4 ? 9 : 3;
  const label = s>=8 ? "Very healthy" : s>=6 ? "Balanced" : s>=4 ? "Fair" : s>=2 ? "Light reward" : "Treat";
  return {hp,coins,label,score:s};
}
function currentAdventure(){
  return state.quests.find(q=>!q.completed) || null;
}
function renderHome(){
  const q=currentAdventure();
  const recent=[...state.history].slice(-3).reverse();
  view.innerHTML=`
    <section class="card hero">
      <p class="muted">Good evening, ${esc(state.profile.name)}</p>
      <h2>Real meals. Real progress.</h2>
      <div class="stat-row">
        <div class="stat-pill"><span>🥕 Health Points</span><strong>${state.profile.hp}</strong></div>
        <div class="stat-pill"><span>🪙 Coins</span><strong>${state.profile.coins}</strong></div>
      </div>
    </section>

    <div class="section-title"><h2>What are we cooking?</h2><button class="btn secondary" onclick="route('recipes')">Browse recipes</button></div>

    ${q ? `
    <section class="card quest">
      <div class="list-row" style="border:0;padding-top:0">
        <div><span class="badge">CURRENT ADVENTURE</span><h3 style="margin:8px 0 4px">${esc(q.title)}</h3></div>
        <span style="font-size:2rem">🌲</span>
      </div>
      <p class="muted">${esc(q.description)}</p>
      ${questProgressMarkup(q)}
    </section>` : `<section class="card"><h3>Adventure complete 🎉</h3><p class="muted">You have cleared every quest in this version.</p></section>`}

    <div class="section-title"><h2>Recently cooked</h2></div>
    ${recent.length ? recent.map(h=>`
      <section class="card list-row">
        <div><strong>${esc(h.recipeName)}</strong><div class="muted">${new Date(h.date).toLocaleDateString()}</div></div>
        <div class="reward"><span>+${h.hp} 🥕</span><span>+${h.coins} 🪙</span></div>
      </section>`).join("") : `<div class="card empty">Log your first meal to begin your adventure.</div>`}
  `;
}
function questProgressMarkup(q){
  let cur=0,target=1;
  if(q.targetHP){cur=Math.min(state.profile.hp,q.targetHP);target=q.targetHP;}
  else {cur=q.progress||0;target=q.target||1;}
  const pct=Math.min(100,Math.round(cur/target*100));
  return `<div class="progress"><div style="width:${pct}%"></div></div><div class="muted">${cur} / ${target}</div>`;
}
function renderRecipes(query=""){
  const filtered=state.recipes.filter(r=>{
    const hay=(r.name+" "+r.cuisine+" "+r.mealType+" "+(r.tags||[]).join(" ")).toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  view.innerHTML=`
    <div class="search-row">
      <input id="recipeSearch" placeholder="Search recipes, ingredients, tags…" value="${esc(query)}" />
      <button class="btn" onclick="openRecipeForm()">+ Add</button>
    </div>
    <div class="grid">
      ${filtered.map(recipeCard).join("")}
    </div>
    ${filtered.length ? "" : `<div class="card empty">No recipes found.</div>`}
  `;
  $("#recipeSearch").addEventListener("input",e=>renderRecipes(e.target.value));
}
function recipeCard(r){
  const rw=rewards(r);
  return `<article class="card recipe-card" onclick="showRecipe('${r.id}')">
    <div class="recipe-art">${esc(r.emoji||"🍽️")}</div>
    <div class="recipe-body">
      <h3>${r.favorite?"⭐ ":""}${esc(r.name)}</h3>
      <div class="meta">${esc(r.cuisine)} · ${r.prep+r.cook} min · ${esc(r.difficulty)}</div>
      <div class="reward"><span>+${rw.hp} 🥕</span><span>+${rw.coins} 🪙</span></div>
    </div>
  </article>`;
}
function showRecipe(id){
  const r=state.recipes.find(x=>x.id===id); if(!r)return;
  const rw=rewards(r);
  modalContent.innerHTML=`
    <div class="recipe-detail">
      <div class="recipe-art">${esc(r.emoji||"🍽️")}</div>
      <div class="list-row" style="align-items:start">
        <div><h2>${esc(r.name)}</h2><div class="muted">${esc(r.cuisine)} · ${r.prep+r.cook} min · ${r.servings} servings</div></div>
        <button type="button" class="icon-btn" onclick="toggleFavorite('${r.id}')">${r.favorite?"⭐":"☆"}</button>
      </div>
      <div>${(r.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="reward"><span>${rw.label}</span><span>+${rw.hp} 🥕</span><span>+${rw.coins} 🪙</span></div>
      <hr>
      <h3>Ingredients</h3>
      <ul class="ingredients">${r.ingredients.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
      <h3>Method</h3>
      <ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>
      ${r.notes?`<h3>Notes</h3><p class="muted">${esc(r.notes)}</p>`:""}
      <div class="modal-actions">
        <button type="button" class="btn ghost" onclick="openRecipeForm('${r.id}')">Edit</button>
        <button type="button" class="btn" onclick="logMeal('${r.id}')">I cooked this</button>
        <button class="btn secondary">Close</button>
      </div>
    </div>`;
  modal.showModal();
}
function toggleFavorite(id){
  const r=state.recipes.find(x=>x.id===id); r.favorite=!r.favorite; save(); showRecipe(id);
}
function openRecipeForm(id=null){
  const r=id?state.recipes.find(x=>x.id===id):{
    name:"",emoji:"🍽️",cuisine:"",mealType:"Dinner",prep:10,cook:20,servings:2,difficulty:"Easy",
    ingredients:[],steps:[],tags:[],notes:"",
    healthFlags:{veg:false,fruit:false,protein:false,wholegrain:false,minimallyProcessed:false,highSugar:false,deepFried:false}
  };
  const f=r.healthFlags||{};
  modalContent.innerHTML=`
    <h2>${id?"Edit":"Add"} Recipe</h2>
    <div class="two-col">
      <div class="field"><label>Name</label><input id="fName" value="${esc(r.name)}" required></div>
      <div class="field"><label>Emoji / icon</label><input id="fEmoji" value="${esc(r.emoji||"🍽️")}"></div>
    </div>
    <div class="two-col">
      <div class="field"><label>Cuisine</label><input id="fCuisine" value="${esc(r.cuisine)}"></div>
      <div class="field"><label>Meal type</label><select id="fMeal"><option>Breakfast</option><option>Lunch</option><option ${r.mealType==="Dinner"?"selected":""}>Dinner</option><option>Snack</option></select></div>
    </div>
    <div class="two-col">
      <div class="field"><label>Prep (min)</label><input id="fPrep" type="number" min="0" value="${r.prep}"></div>
      <div class="field"><label>Cook (min)</label><input id="fCook" type="number" min="0" value="${r.cook}"></div>
    </div>
    <div class="two-col">
      <div class="field"><label>Servings</label><input id="fServings" type="number" min="1" value="${r.servings}"></div>
      <div class="field"><label>Difficulty</label><select id="fDiff"><option>Easy</option><option ${r.difficulty==="Medium"?"selected":""}>Medium</option><option ${r.difficulty==="Hard"?"selected":""}>Hard</option></select></div>
    </div>
    <div class="field"><label>Ingredients — one per line</label><textarea id="fIngredients" rows="7">${esc(r.ingredients.join("\n"))}</textarea></div>
    <div class="field"><label>Steps — one per line</label><textarea id="fSteps" rows="7">${esc(r.steps.join("\n"))}</textarea></div>
    <div class="field"><label>Tags — comma separated</label><input id="fTags" value="${esc((r.tags||[]).join(", "))}"></div>
    <div class="field"><label>Health qualities</label>
      <div class="checkbox-grid">
        ${healthCheck("veg","Contains vegetables",f.veg)}
        ${healthCheck("fruit","Contains fruit",f.fruit)}
        ${healthCheck("protein","Good protein source",f.protein)}
        ${healthCheck("wholegrain","Whole grains",f.wholegrain)}
        ${healthCheck("minimallyProcessed","Mostly whole/minimally processed",f.minimallyProcessed)}
        ${healthCheck("highSugar","High added sugar",f.highSugar)}
        ${healthCheck("deepFried","Deep fried",f.deepFried)}
      </div>
    </div>
    <div class="field"><label>Personal notes</label><textarea id="fNotes" rows="3">${esc(r.notes||"")}</textarea></div>
    <div class="modal-actions">
      ${id?`<button type="button" class="btn danger" onclick="deleteRecipe('${id}')">Delete</button>`:""}
      <button class="btn secondary">Cancel</button>
      <button type="button" class="btn" onclick="saveRecipe('${id||""}')">Save recipe</button>
    </div>`;
  modal.showModal();
}
function healthCheck(key,label,checked){
  return `<label class="check"><input type="checkbox" id="h_${key}" ${checked?"checked":""}>${label}</label>`;
}
function saveRecipe(id){
  const data={
    id:id||crypto.randomUUID(),
    name:$("#fName").value.trim()||"Untitled Recipe",
    emoji:$("#fEmoji").value.trim()||"🍽️",
    cuisine:$("#fCuisine").value.trim()||"Uncategorised",
    mealType:$("#fMeal").value,
    prep:+$("#fPrep").value||0,
    cook:+$("#fCook").value||0,
    servings:+$("#fServings").value||1,
    difficulty:$("#fDiff").value,
    ingredients:$("#fIngredients").value.split("\n").map(s=>s.trim()).filter(Boolean),
    steps:$("#fSteps").value.split("\n").map(s=>s.trim()).filter(Boolean),
    tags:$("#fTags").value.split(",").map(s=>s.trim()).filter(Boolean),
    notes:$("#fNotes").value.trim(),
    favorite:id ? state.recipes.find(x=>x.id===id)?.favorite||false : false,
    healthFlags:{
      veg:$("#h_veg").checked,
      fruit:$("#h_fruit").checked,
      protein:$("#h_protein").checked,
      wholegrain:$("#h_wholegrain").checked,
      minimallyProcessed:$("#h_minimallyProcessed").checked,
      highSugar:$("#h_highSugar").checked,
      deepFried:$("#h_deepFried").checked
    }
  };
  if(id) state.recipes=state.recipes.map(x=>x.id===id?data:x); else state.recipes.push(data);
  save(); modal.close(); renderRecipes();
}
function deleteRecipe(id){
  state.recipes=state.recipes.filter(x=>x.id!==id); save(); modal.close(); renderRecipes();
}
function logMeal(id){
  const r=state.recipes.find(x=>x.id===id); if(!r)return;
  const rw=rewards(r);
  state.profile.hp+=rw.hp;
  state.profile.coins+=rw.coins;
  state.profile.mealsLogged++;
  state.profile.lastMealDate=new Date().toISOString();
  state.history.push({id:crypto.randomUUID(),recipeId:id,recipeName:r.name,date:new Date().toISOString(),hp:rw.hp,coins:rw.coins});
  updateQuestProgress(r);
  save();
  modalContent.innerHTML=`
    <div style="text-align:center;padding:16px 4px">
      <div style="font-size:4rem">✨</div>
      <h2>Meal logged!</h2>
      <p>${esc(r.name)} moved your adventure forward.</p>
      <div class="reward" style="justify-content:center;font-size:1rem"><span>+${rw.hp} 🥕</span><span>+${rw.coins} 🪙</span></div>
      <div class="modal-actions"><button class="btn">Continue</button></div>
    </div>`;
}
function updateQuestProgress(r){
  for(const q of state.quests){
    if(q.completed) continue;
    if(q.type==="vegMeals" && r.healthFlags?.veg) q.progress=(q.progress||0)+1;
    if(q.type==="balancedMeal" && r.healthFlags?.veg && r.healthFlags?.protein) q.progress=(q.progress||0)+1;

    let ready=false;
    if(q.targetHP && state.profile.hp>=q.targetHP) ready=true;
    if(q.target && (q.progress||0)>=q.target) ready=true;
    if(ready){
      q.completed=true;
      state.profile.coins+=q.rewardCoins||0;
      if(q.rewardItem) state.inventory.push({name:q.rewardItem,icon:"🎁",source:"Quest reward"});
    }
  }
}
function renderAdventure(){
  view.innerHTML=`
    <section class="card hero">
      <p class="muted">Your real-world meals power this story.</p>
      <h2>🌲 The Verdant Path</h2>
      <p>Restore a quiet world one healthy meal at a time.</p>
    </section>
    ${state.quests.map((q,i)=>`
      <section class="card quest ${q.completed?"done":""}">
        <div class="list-row" style="border:0;padding-top:0">
          <div><span class="badge">${q.completed?"CLEARED":"CHAPTER "+(i+1)}</span><h3 style="margin:8px 0 4px">${esc(q.title)}</h3></div>
          <span style="font-size:2rem">${q.completed?"✅":"📜"}</span>
        </div>
        <p class="muted">${esc(q.description)}</p>
        ${questProgressMarkup(q)}
        <div class="reward"><span>Reward: ${q.rewardCoins} 🪙</span><span>${esc(q.rewardItem)}</span></div>
      </section>`).join("")}
  `;
}
function renderCollection(){
  view.innerHTML=`
    <section class="card">
      <h2>🎒 Collection</h2>
      <p class="muted">Quest rewards and purchased cosmetics live here.</p>
      ${state.inventory.length?state.inventory.map(x=>`
        <div class="list-row"><div><strong>${esc(x.icon||"🎁")} ${esc(x.name)}</strong><div class="muted">${esc(x.source||"Owned")}</div></div></div>
      `).join(""):`<div class="empty">Your collection is empty. Complete quests or visit the shop.</div>`}
    </section>
    <div class="section-title"><h2>Village Shop</h2><span>🪙 ${state.profile.coins}</span></div>
    ${state.shop.map(item=>{
      const owned=state.inventory.some(x=>x.id===item.id);
      return `<section class="card shop-item">
        <div style="display:flex;gap:12px;align-items:center"><span class="shop-icon">${item.icon}</span><div><strong>${esc(item.name)}</strong><div class="muted">${item.price} coins</div></div></div>
        <button class="btn ${owned?"secondary":""}" ${owned?"disabled":""} onclick="buyItem('${item.id}')">${owned?"Owned":"Buy"}</button>
      </section>`;
    }).join("")}
  `;
}
function buyItem(id){
  const item=state.shop.find(x=>x.id===id); if(!item)return;
  if(state.profile.coins<item.price){ alert("You need more coins."); return; }
  if(state.inventory.some(x=>x.id===id)) return;
  state.profile.coins-=item.price;
  state.inventory.push({...item,source:"Village shop"});
  save(); renderCollection();
}
function renderProfile(){
  view.innerHTML=`
    <section class="card">
      <h2>${esc(state.profile.name)}'s Journey</h2>
      <div class="list-row"><span>Meals logged</span><strong>${state.profile.mealsLogged}</strong></div>
      <div class="list-row"><span>Total Health Points</span><strong>${state.profile.hp} 🥕</strong></div>
      <div class="list-row"><span>Coins available</span><strong>${state.profile.coins} 🪙</strong></div>
      <div class="list-row"><span>Recipes saved</span><strong>${state.recipes.length}</strong></div>
      <div class="list-row"><span>Quest items</span><strong>${state.inventory.length}</strong></div>
    </section>
    <section class="card">
      <h3>Profile name</h3>
      <div class="search-row"><input id="profileName" value="${esc(state.profile.name)}"><button class="btn" onclick="saveProfile()">Save</button></div>
    </section>
    <section class="card">
      <h3>Data</h3>
      <p class="muted">This version stores everything locally in your browser/device.</p>
      <button class="btn ghost" onclick="exportData()">Export save</button>
      <button class="btn danger" style="margin-left:6px" onclick="resetData()">Reset app</button>
    </section>
  `;
}
function saveProfile(){state.profile.name=$("#profileName").value.trim()||"Cook";save();renderProfile();}
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="recipe-quest-save.json";a.click();URL.revokeObjectURL(a.href);
}
function resetData(){
  if(confirm("Reset all recipes, game progress and purchases?")){
    state=structuredClone(seed);save();route("home");
  }
}

window.route=route;
window.showRecipe=showRecipe;
window.openRecipeForm=openRecipeForm;
window.saveRecipe=saveRecipe;
window.deleteRecipe=deleteRecipe;
window.toggleFavorite=toggleFavorite;
window.logMeal=logMeal;
window.buyItem=buyItem;
window.saveProfile=saveProfile;
window.exportData=exportData;
window.resetData=resetData;

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false;
});
$("#installBtn").addEventListener("click",async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true;
});
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});

route("home");
