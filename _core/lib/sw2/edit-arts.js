"use strict";
const gameSystem = 'sw2';

window.onload = function() {
  checkCategory();
  setSchoolItemList();
  setSchoolMonsterList();
  checkMagicClass();
  setupSchoolMagicRows();
  setupRangeField();

  changeColor();
  deleteLoadingArea();
}

// 送信前チェック ----------------------------------------
function formCheck(){
  if(form.category.value === ''){
    alert('カテゴリを選択してください。');
    form.category.focus();
    return false;
  }
  else if(form.category.value === 'magic' && form.magicName.value === ''){
    alert('名称を入力してください。');
    form.magicName.focus();
    return false;
  }
  else if(form.category.value === 'god' && form.godName.value === ''){
    alert('名称を入力してください。');
    form.godName.focus();
    return false;
  }
  else if(form.category.value === 'school' && form.schoolName.value === ''){
    alert('名称を入力してください。');
    form.schoolName.focus();
    return false;
  }
  else if(form.category.value === 'skill' && form.skillName.value === ''){
    alert('名称を入力してください。');
    form.skillName.focus();
    return false;
  }
  if(!formPasswordCheck()){
    return false;
  }
  return true;
}

// 名前 ----------------------------------------
function setName(){
  const category = form.category.value;
  let name;
  if(category == 'magic'){
    name = '【'+ruby(form.magicName.value)+'】';
  }
  else if(category == 'god'){
    name = (form.godAka.value ? `“${ruby(form.godAka.value)}”` : '') + ruby(form.godName.value);
  }
  else if(category == 'school'){
    name = '【'+ruby(form.schoolName.value)+'】';
  }
  else if(category == 'skill'){
    name = '【'+ruby(form.skillName.value)+'】';
  }
  let output = name || '(名称未入力)';
  document.querySelector('#header-menu > h2 > span').innerHTML = output;
  document.querySelectorAll('.color-sample .name').forEach(div => {
    div.innerHTML = output;
  })

}

// カテゴリ ----------------------------------------
function checkCategory(){
  const category = form.category.value;
  document.querySelectorAll('article > form .data-area').forEach( obj => {
    obj.style.display = 'none';
  });
  if(category){
    document.getElementById('data-'+category).style.display = 'block';
    setName();
  }
  else { document.getElementById('data-none').style.display = 'block'; }

  let sheetKind;
  switch (category) {
    case 'magic':
      sheetKind = "魔法";
      break;
    case 'god':
      sheetKind = '神格';
      break;
    case 'school':
      sheetKind = '流派';
      break;
    case 'skill':
      sheetKind = '特殊能力';
  }
  document.querySelector('#header-menu .menu-items > .sheet-main .sheet-kind').textContent = sheetKind ?? '';

  if (category === 'skill') {
    checkRankMode();
  }
}

// 魔法系統 ----------------------------------------
function checkMagicClass(){
  const magic = form.magicClass.value;
  setupMagicInputs(document.querySelector('#data-magic'), magic, 'magic', true);
}
function setupMagicInputs(root, magic, prefix, updateSharedLists = false, initializeDefaults = true){
  let items;
  if(magic == '練技'){
    items = ['duration'];
  }
  else if(magic == '呪歌'){
    items = ['song','condition','resist','element'];
  }
  else if(magic == '終律'){
    items = ['cost','resist','element'];
    setupMagicCostField(root, prefix, 'list-cost-song', false, initializeDefaults);
  }
  else if(magic == '騎芸'){
    items = ['premise','rider','part'];
  }
  else if(magic == '賦術'){
    items = ['cost','target','range','duration','resist'];
    setupMagicCostField(root, prefix, 'list-cost-alchemy', false, initializeDefaults);
  }
  else if(magic == '相域'){
    items = ['cost','duration','element'];
    setupMagicCostField(root, prefix, 'list-cost-geomancy', false, initializeDefaults);
  }
  else if(magic == '鼓咆'){
    items = ['type','rank','command','commcost'];
  }
  else if(magic == '陣率'){
    items = ['premise','condition','commcost'];
  }
  else if(magic == '占瞳'){
    items = ['type','target','range','duration'];
  }
  else if(magic == '魔装'){
    items = ['premise','part','human-form'];
  }
  else if(magic == '操気'){
    items = ['cost','premise','target','range','duration','resist'];
    setupMagicCostField(root, prefix, 'list-cost-psychokinesis', false, initializeDefaults);
  }
  else if(magic == '呪印'){
    items = ['type','premise'];
  }
  else if(magic == '貴格'){
    items = ['type','target','premise'];
  }
  else if(magic == '魔動機術'){
    items = ['cost','target','range','duration','resist','element','sphere'];
    setupMagicCostField(root, prefix, 'list-cost', true, initializeDefaults);
  }
  else {
    items = ['cost','target','range','duration','resist','element'];
    setupMagicCostField(root, prefix, 'list-cost', true, initializeDefaults);
  }
  viewMagicInputs(items, root);

  const showSpecialActionTypes = /^(騎芸|操気)$/.test(magic);
  for (const suffix of ['ActionTypePassive', 'ActionTypeMajor']) {
    const input = root.querySelector(`[name="${prefix}${suffix}"]`);
    const wrapper = input?.closest('.action-passive, .action-major') ?? input?.parentNode;
    if(wrapper){ wrapper.style.display = showSpecialActionTypes ? '' : 'none'; }
  }
  const summary = root.querySelector('dl.summary');
  if(summary){ summary.style.display = (magic == '呪印' || magic == '貴格') ? 'none' : ''; }
  setMagicHeading(root, 'level', magic.match(/(属性|特殊)妖精魔法|秘奥魔法/) ? 'ランク' : '習得レベル');
  setMagicHeading(root, 'type', (magic == '鼓咆') ? '鼓咆の系統' : (magic == '占瞳') ? 'タイプなど' : (magic == '貴格') ? '形態' : '対応');
  setMagicHeading(root, 'premise', (magic == '呪印') ? '前提ＡＣ' : '前提');
  setMagicHeading(root, 'condition', (magic == '呪歌') ? '効果発生条件' : (magic == '陣率') ? '使用条件' : '条件');

  const levelInput = root.querySelector('dl.level dd input');
  const craftClasses = new Set(['練技','呪歌','終律','騎芸','賦術','相域','鼓咆','陣率','占瞳','魔装','操気','呪印','貴格']);
  if (craftClasses.has(magic)) {
    levelInput?.setAttribute('list', 'list-craft-required-level');
  } else {
    levelInput?.removeAttribute('list');
  }

  if(updateSharedLists){
    const targetOptionSelf = document.querySelector('#list-target option.self');
    const rangeOptionSelf = document.querySelector('#list-range option.self');
    targetOptionSelf?.setAttribute('value', craftClasses.has(magic) ? '自身' : '術者');
    rangeOptionSelf?.setAttribute('value', craftClasses.has(magic) ? '自身' : '術者');
  }
}
function setupMagicCostField(root, prefix, list, useDefaultMp, initializeDefaults = true){
  const costField = root.querySelector(`[name="${prefix}Cost"]`) ?? root.querySelector('dl.cost input');
  if(!costField){ return; }
  if(initializeDefaults){
    if(!useDefaultMp && costField.value == 'MP'){ costField.value = ''; }
    if(useDefaultMp && costField.value == ''){ costField.value = 'MP'; }
  }
  costField.setAttribute('list', list);
}
function setMagicHeading(root, className, text){
  const heading = root.querySelector(`dl.${className} dt`);
  if(heading){ heading.textContent = text; }
}
function viewMagicInputs(items, root = document.querySelector('#data-magic')){
  root.querySelectorAll('dl').forEach(obj => {
    obj.style.display = 'none';
  });
  for (const item of ['name','class','acquire-cost','minor','level','summary','effect','description', ...items]) {
    root.querySelectorAll(`dl.${item}`).forEach(obj => {
      obj.style.display = '';
    });
  }
}
// 流派アイテム欄 ----------------------------------------
// 追加
let schoolItems = [];
let errorGetItem
async function setSchoolItemList(){
  if(form.schoolItemList.value){
    schoolItems = Array.from(new Set(form.schoolItemList.value.split(',')));
  }
}
async function addSchoolItem(){
  const urlForm = document.getElementById('schoolItemUrl');
  const url = urlForm.value;
  if(!url){ return; }
  if(!schoolItems.includes(url)){
    const data = await getYtsheetJSON(url);
    if(data){
      if(data.itemName == null){ alert('アイテムデータではありません。'); return; }
      let tr = document.createElement('tr');
      tr.setAttribute('class','item-data');
      tr.innerHTML = `
        <td><a href="${url}" target="_blank">${ruby(data.itemName||'')}</a></td>
        <td>${data?.category.replace(/\s+/g, '<hr>') ?? ''}</td>
        <td>${data.summary ||''}</td>
        <td class="button" onclick="delSchoolItem(this,'${url}')">×</td>
      `;
      document.querySelector("#school-item-list tbody").appendChild(tr);
      schoolItems.push(url);
      form.schoolItemList.value = schoolItems.join(',');
      urlForm.value = "";
    }
  }
  else {
    alert('そのデータは追加済みです');
    urlForm.value = "";
  }
}

// 削除
function delSchoolItem(obj, url){
  obj.parentNode.remove();
  schoolItems = schoolItems.filter(n => n != url);
  console.log(url,schoolItems);
  form.schoolItemList.value = schoolItems.join(',');
}

// 魔物データ欄 ----------------------------------------
let schoolMonsters = [];
function setSchoolMonsterList(){
  if(form.schoolMonsterList.value){
    schoolMonsters = Array.from(new Set(form.schoolMonsterList.value.split(',')));
  }
}

async function addSchoolMonster(){
  const urlForm = document.getElementById('schoolMonsterUrl');
  const url = urlForm.value;
  if(!url){ return; }
  if(schoolMonsters.includes(url)){
    alert('そのデータは追加済みです');
    urlForm.value = '';
    return;
  }

  const data = await getYtsheetJSON(url);
  if(!data){ return; }
  if(data.type !== 'm' || (!data.monsterName && !data.characterName)){
    alert('魔物データではありません。');
    return;
  }

  const isMount = data.mount === '1' || data.mount === 1 || data.mount === true;
  const tbody = document.querySelector(`#${isMount ? 'school-mount-list' : 'school-monster-list'} tbody`);
  if(!tbody){
    throw new Error(`${isMount ? '騎獣' : '魔物'}データ一覧が見つかりません。`);
  }
  tbody.append(createSchoolMonsterRow(url, data));
  schoolMonsters.push(url);
  form.schoolMonsterList.value = schoolMonsters.join(',');
  urlForm.value = '';
}

function createSchoolMonsterRow(url, data){
  const row = document.createElement('tr');
  row.dataset.referenceUrl = url;
  const name = data.characterName ? `${data.characterName}${data.monsterName ? `【${data.monsterName}】` : ''}`
    : data.monsterName;
  const isMount = data.mount === '1' || data.mount === 1 || data.mount === true;
  const level = isMount
    ? [data.lvMin, data.lvMax].filter(Boolean).join('～') || data.lv
    : data.lv;
  const summary = [level, isMount ? data.price : data.habitat].filter(Boolean).join('／');
  const nameCell = row.insertCell();
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = name || '';
  nameCell.append(link);
  row.insertCell().textContent = data.taxa || '';
  if(isMount){
    row.insertCell().textContent = level || '';
    row.insertCell().textContent = data.partsNum || '';
    row.insertCell().textContent = formatSchoolMountPrice(data.price);
    row.insertCell().textContent = formatSchoolMountPrice(data.priceRental);
    row.insertCell().textContent = formatSchoolMountPrice(data.priceRegenerate);
  }
  else {
    row.insertCell().textContent = summary || '';
  }
  const deleteCell = row.insertCell();
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '×';
  button.addEventListener('click', () => delSchoolMonster(button, url));
  deleteCell.append(button);
  return row;
}

function formatSchoolMountPrice(value){
  if(value == null || value === ''){ return ''; }
  let price = String(value);
  const annotation = price.match(/([(（].+?[）)])$/)?.[1] || '';
  if(annotation){ price = price.slice(0, -annotation.length); }
  const unit = /\d$/.test(price) ? 'G' : '';
  return `${commify(price)}${unit}${annotation}`;
}

function delSchoolMonster(obj, url){
  obj.closest('tr')?.remove();
  schoolMonsters = schoolMonsters.filter(value => value !== url);
  form.schoolMonsterList.value = schoolMonsters.join(',');
}

function setupSchoolMagicRows(){
  setupSchoolMagicClassFreeInput(getSchoolMagicClassAllInput(), checkSchoolMagicClassAll);
  document.querySelectorAll('#school-magic-list > .school-magic-data').forEach(row => {
    setupSchoolMagicRow(row, false);
  });
}

function setupSchoolMagicRow(row, initializeDefaults = false){
  const nameField = row.querySelector('dl.name input[name$="Name"]');
  const prefix = nameField?.name.replace(/Name$/, '');
  if(!prefix){
    console.error('秘伝魔法の入力名を取得できません。');
    return;
  }
  const classInput = row.querySelector('dl.class .select-input');
  setupSchoolMagicClassFreeInput(classInput, checkSchoolMagicClass);

  const schoolMagicClass = getSchoolMagicClassAllValue();
  const isIndividual = schoolMagicClass === '__individual__';
  const magic = isIndividual
    ? getSchoolMagicClassValue(classInput)
    : schoolMagicClass === '__none__' ? '' : schoolMagicClass;
  setupMagicInputs(row, magic, prefix, false, initializeDefaults);
  const classRow = classInput?.closest('dl.class');
  if(classRow){ classRow.style.display = isIndividual ? '' : 'none'; }
  setupRangeField(row.querySelector(`[name="${prefix}Range"]`));
}

function getSchoolMagicClassAllInput(){
  const select = document.querySelector('select[name="schoolMagicClass"], select[name="schoolMagicClassSelect"]');
  return select?.closest('.select-input');
}

function getSchoolMagicClassAllValue(){
  const input = getSchoolMagicClassAllInput();
  return input ? getSchoolMagicClassValue(input) : '__individual__';
}

function getSchoolMagicClassValue(root){
  const select = root?.querySelector('select');
  if(!select){ return ''; }
  return select.value === 'free'
    ? root.querySelector('input[type="text"]')?.value || ''
    : select.value || '';
}

function setupSchoolMagicClassFreeInput(root, callback){
  const input = root?.querySelector('input[type="text"]');
  if(!input || input.dataset.schoolMagicClassReady){ return; }
  input.dataset.schoolMagicClassReady = '1';
  input.addEventListener('input', () => callback(input));
}

function checkSchoolMagicClassAll(){
  document.querySelectorAll('#school-magic-list > .school-magic-data').forEach(row => {
    setupSchoolMagicRow(row, true);
  });
}

function checkSchoolMagicClass(field){
  const row = field?.closest('.school-magic-data');
  if(row){ setupSchoolMagicRow(row, true); }
}
// 秘伝欄 ----------------------------------------
// 追加
function addSchoolArts(){
  document.querySelector("#arts-list").append(createRow('school-arts','schoolArtsNum'));
}
// 削除
function delSchoolArts(){
  delRow('schoolArtsNum', '#arts-list .input-data:last-child');
}
// 並べ替え
setSortable('schoolArts','#arts-list','.input-data');

// 秘伝魔法欄 ----------------------------------------
// 追加
function addSchoolMagic(){
  const row = createRow('school-magic','schoolMagicNum');
  document.querySelector("#school-magic-list").append(row);
  setupSchoolMagicRow(row, true);
}
// 削除
function delSchoolMagic(){
  delRow('schoolMagicNum', '#school-magic-list .input-data:last-child');
}
// 並べ替え
setSortable('schoolMagic','#school-magic-list','.input-data');

// 特殊能力 ----------------------------------------
function checkRankMode() {
  const details = document.querySelector('#data-skill > .details');
  let mode;
  switch (form['skillRankMode'].value ?? '') {
    case '0':
      mode = 'no-rank';
      break;
    case '1':
      mode = 'ranks';
      break;
  }

  if (mode != null) {
    details.dataset.mode = mode;
  } else {
    delete details.dataset.mode;
  }
}

function setupRangeField(rangeField = null) {
  const rangeFields =
    (rangeField != null)
      ? [rangeField]
      : [...document.querySelectorAll('[name="magicRange"], [name^="godMagic"][name$="Range"], [name^="schoolMagic"][name$="Range"]')];

  rangeFields.forEach(rangeField => {
    if(rangeField.dataset.rangeFieldReady){ return; }
    rangeField.dataset.rangeFieldReady = '1';
    rangeField.addEventListener('input', () => {
      const formField = rangeField.parentNode.querySelector(`[name$="Form"]`);
      if ((rangeField.value === '術者' || rangeField.value === '接触') && (formField?.value?.trim() ?? '') === '') {
        formField.value = '―';
      }
    });
  });
}
